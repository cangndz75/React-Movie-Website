const { isValidObjectId } = require("mongoose");
const Movie = require("../models/movie");
const Review = require("../models/review");
const { sendError, getAverageRatings } = require("../utils/helper");

exports.addReview = async (req, res) => {
  const { movieId } = req.params;
  const { content, rating,isSpoiler } = req.body;
  const userId = req.user._id;

  if (!req.user.isVerified)
    return sendError(res, "Lütfen önce hesabınızı doğrulayın!");

  if (!isValidObjectId(movieId)) return sendError(res, "Geçersiz film!");

  const movie = await Movie.findOne({ _id: movieId, status: "public" });
  if (!movie) return sendError(res, "Film bulunamadı!", 404);

  const isAlreadyReviewed = await Review.findOne({
    owner: userId,
    parentMovie: movie._id,
  });
  if (isAlreadyReviewed)
    return sendError(res, "Geçersiz istek! Değerlendirme zaten yapıldı.");

  const newReview = new Review({
    owner: userId,
    parentMovie: movie._id,
    content,
    rating,
    isSpoiler,
  });

  movie.reviews.push(newReview._id);
  await movie.save();


  await newReview.save();

  const reviews = await getAverageRatings(movie._id);

  res.json({ message: "Değerlendirmen eklendi!", reviews });
};

exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating,isSpoiler } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Hatalı değerlendirme ID'si");

  const review = await Review.findOne({ owner: userId, _id: reviewId });
  if (!review) return sendError(res, "Değerlendirme bulunamadı!", 404);

  review.content = content;
  review.rating = rating;
  review.isSpoiler = isSpoiler;

  await review.save();

  res.json({ message: "Değerlendirmen güncellendi!" });
};

exports.removeReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Hatalı değerlendirme ID'si");

  const review = await Review.findOne({ owner: userId, _id: reviewId });
  if (!review) return sendError(res, "Hatalı istek, değerlendirme bulunamadı!");

  const movie = await Movie.findById(review.parentMovie).select("reviews");
  movie.reviews = movie.reviews.filter((rId) => rId.toString() !== reviewId);

  await Review.findByIdAndDelete(reviewId);

  await movie.save();

  res.json({ message: "Değerlendirmen silindi!" });
};


exports.getReviewsByMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, "Hatalı değerlendirme ID'si");

  const movie = await Movie.findById(movieId)
    .populate({
      path: "reviews",
      populate: {
        path: "owner",
        select: "name",
      },
    })
    .select("reviews title");

  const reviews = movie.reviews.map((r) => {
    const { owner, content,isSpoiler, rating, _id: reviewID } = r;
    const { name, _id: ownerId } = owner;

    return {
      id: reviewID,
      owner: {
        id: ownerId,
        name,
      },
      content,
      rating,
      isSpoiler
    };
  });

  res.json({ movie: { reviews, title: movie.title } });
};
