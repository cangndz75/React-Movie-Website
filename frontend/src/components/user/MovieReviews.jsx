import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { deleteReview, getReviewByMovie } from "../../api/review";
import { useAuth, useNotification } from "../../hooks";
import Container from "../Container";
import CustomButtonLink from "../CustomButtonLink";
import RatingStar from "../RatingStar";
import ConfirmModal from "../models/ConfirmModal";
import NotFoundText from "../NotFoundText";
import EditRatingModal from "../models/EditRatingModal";
import { ImBackward } from "react-icons/im";

const getNameInitial = (name = "") => {
  return name[0].toUpperCase();
};

export default function MovieReviews() {
  const [reviews, setReviews] = useState([]);
  const [movieTitle, setMovieTitle] = useState("");
  const [profileOwnersReview, setProfileOwnersReview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Önceki sayfaya geri dön
  };

  const { movieId } = useParams();
  const { authInfo } = useAuth();
  const profileId = authInfo.profile?.id;

  const { updateNotification } = useNotification();

  const fetchReviews = async () => {
    const { movie, error } = await getReviewByMovie(movieId);
    if (error) return updateNotification("error", error);

    setReviews([...movie.reviews]);
    setMovieTitle(movie.title);
  };

  const findProfileOwnersReview = () => {
    if (profileOwnersReview) return setProfileOwnersReview(null);

    const matched = reviews.find((review) => review.owner.id === profileId);
    if (!matched)
      return updateNotification(
        "error",
        "Herhangi bir değerlendirmeniz bulunmuyor!"
      );

    setProfileOwnersReview(matched);
  };

  const handleOnEditClick = () => {
    const { id, content, rating,isSpoiler } = profileOwnersReview;
    setSelectedReview({
      id,
      content,
      rating,
      isSpoiler
    });

    setShowEditModal(true);
  };

  const handleDeleteConfirm = async () => {
    setBusy(true);
    const { error, message } = await deleteReview(profileOwnersReview.id);
    setBusy(false);
    if (error) return updateNotification("error", error);

    updateNotification("success", message);

    const updatedReviews = reviews.filter(
      (r) => r.id !== profileOwnersReview.id
    );
    setReviews(updatedReviews);
    setProfileOwnersReview(null);
    hideConfirmModal();
  };

  const handleOnReviewUpdate = (review) => {
    const updatedReview = {
      ...profileOwnersReview,
      rating: review.rating,
      content: review.content,
      isSpoiler:review.isSpoiler,
    };

    setProfileOwnersReview(updatedReview);

    const newReviews = reviews.map((r) => {
      if (r.id === updatedReview.id) return updatedReview;
      return r;
    });

    setReviews(newReviews);
  };

  const displayConfirmModal = () => setShowConfirmModal(true);
  const hideConfirmModal = () => setShowConfirmModal(false);
  const hideEditModal = () => {
    setShowEditModal(false);
    setSelectedReview(null);
  };

  useEffect(() => {
    if (movieId) fetchReviews();
  }, [movieId]);

  return (
    <div className="dark:bg-primary bg-white min-h-screen pb-10">
      <Container className="xl:px-0 px-2 py-8">
        <button
          className="bg-white-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full w-12"
          onClick={handleGoBack}
        >
          <ImBackward />
        </button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold dark:text-white text-secondary">
            <span className="text-light-subtle dark:text-dark-subtle font-normal">
              {movieTitle} için değerlendirmeler:
            </span>
          </h1>

          {profileId ? (
            <CustomButtonLink
              label={profileOwnersReview ? "Tümünü Gör" : "Değerlendirmemi Bul"}
              onClick={findProfileOwnersReview}
            />
          ) : null}
        </div>

        <NotFoundText text="Değerlendirme yok!" visible={!reviews.length} />

        {profileOwnersReview ? (
          <div>
            <ReviewCard review={profileOwnersReview} />
            <div className="flex space-x-3 dark:text-white text-primary text-xl p-3">
              <button onClick={displayConfirmModal} type="button">
                <BsTrash />
              </button>
              <button onClick={handleOnEditClick} type="button">
                <BsPencilSquare />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {reviews.map((review) => (
              <ReviewCard review={review} key={review.id} />
            ))}
          </div>
        )}
      </Container>

      <ConfirmModal
        visible={showConfirmModal}
        onCancel={hideConfirmModal}
        onConfirm={handleDeleteConfirm}
        busy={busy}
        title="Onaylıyor musunuz?"
        subtitle="Değerlendirmeniz kalıcı olarak silinecektir!"
      />

      <EditRatingModal
        visible={showEditModal}
        initialState={selectedReview}
        onSuccess={handleOnReviewUpdate}
        onClose={hideEditModal}
      />
    </div>
  );
}

const ReviewCardWrapper = ({ review }) => {
  if (!review) return null;

  return <ReviewCard review={review} />;
};

const ReviewCard = ({ review }) => {
  const { owner, content, rating } = review;
  const isSpoiler = review.isSpoiler;
  const [showContent, setShowContent] = useState(false);

  const handleClick = () => {
    setShowContent(!showContent);
  };

  const renderedContent = isSpoiler ? (
    <p
      className="text-light-subtle dark:text-dark-subtle cursor-pointer"
      style={{ filter: showContent ? "blur(0px)" : "blur(1px)" }}
      onClick={handleClick}
    >
      {showContent ? content : "Bu yorum spoiler içeriyor. Görmek için tıklayın."}
    </p>
  ) : (
    <p className="text-light-subtle dark:text-dark-subtle">{content}</p>
  );

  return (
    <div className="flex space-x-3">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-light-subtle dark:bg-dark-subtle text-white text-xl select-none">
        {getNameInitial(owner.name)}
      </div>
      <div>
        <h1 className="dark:text-white text-secondary font-semibold text-lg">
          {owner.name}
        </h1>
        <RatingStar rating={rating} />
        {renderedContent}
      </div>
    </div>
  );
};

