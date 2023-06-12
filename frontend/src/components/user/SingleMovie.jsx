import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSingleMovie } from "../../api/movie";
import { useAuth, useNotification } from "../../hooks";
import { convertReviewCount } from "../../utils/helper";
import Container from "../Container";
import CustomButtonLink from "../CustomButtonLink";
import AddRatingModal from "../models/AddRatingModal";
import ProfileModal from "../models/ProfileModal";
import RatingStar from "../RatingStar";
import RelatedMovies from "../RelatedMovies";
import { FiChevronsUp } from "react-icons/fi";
import { AiOutlineStar } from "react-icons/ai";

const convertDate = (date = "") => {
  return date.split("T")[0];
};

export default function SingleMovie() {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [ready, setReady] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [movie, setMovie] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState({});

  const { movieId } = useParams();
  const { updateNotification } = useNotification();
  const { authInfo } = useAuth();
  const { isLoggedIn } = authInfo;

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navigate = useNavigate();

  const fetchMovie = async () => {
    const { error, movie } = await getSingleMovie(movieId);
    if (error) return updateNotification("error", error);

    setReady(true);
    setMovie(movie);
  };

  const handleOnRateMovie = () => {
    if (!isLoggedIn) return navigate("/auth/signin");
    setShowRatingModal(true);
  };

  const hideRatingModal = () => {
    setShowRatingModal(false);
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const hideProfileModal = () => {
    setShowProfileModal(false);
  };

  const handleOnRatingSuccess = (reviews) => {
    setMovie({ ...movie, reviews: { ...reviews } });
  };

  useEffect(() => {
    if (movieId) fetchMovie();
  }, [movieId]);

  if (!ready)
    return (
      <div className="h-screen flex justify-center items-center dark:bg-primary bg-white">
        <p className="text-light-subtle dark:text-dark-subtle animate-pulse">
          Lütfen bekleyin...
        </p>
      </div>
    );

  const {
    id,
    trailer,
    poster,
    title,
    storyLine,
    language,
    releseDate,
    type,
    director = {},
    reviews = {},
    writers = [],
    cast = [],
    genres = [],
  } = movie;

  return (
    <div className="dark:bg-primary bg-white min-h-screen pb-10">
      <Container className="xl:px-0 px-2">
        <div className="flex gap-4">
          <div className="w-1/2">
            <img
              src={poster}
              alt={title}
              className="w-full rounded-lg object-cover"
            />
          </div>
          <div className="w-1/2">
            <video controls src={trailer} className="w-full h-auto"></video>
          </div>
        </div>

        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <h1 className="xl:text-4xl lg:text-3xl text-2xl text-highlight dark:text-highlight-dark font-semibold py-3">
            {title}
          </h1>
          <div className="flex items-center">
            <RatingStar rating={reviews.ratingAvg} />
            <div className="flex items-center ml-4">
              <div className="h-6 w-px bg-black mx-2"></div>{" "}
              {/* Siyah dikey çizgi */}
              <CustomButtonLink
                label={
                  convertReviewCount(reviews.reviewCount) + " değerlendirme"
                }
                onClick={() => navigate("/movie/reviews/" + id)}
                className="text-sm text-gray-500 dark:text-gray-400 underline ml-4"
              />
              {isLoggedIn && (
                <>
                  <div className="h-6 w-px bg-black mx-2"></div>{" "}
                  {/* Siyah dikey çizgi */}
                  <CustomButtonLink
                    label="Değerlendir"
                    onClick={handleOnRateMovie}
                    className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded"
                  />
                </>
              )}
            </div>
          </div>
        </div>
        {showScrollButton && (
          <button
            className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={handleScrollToTop}
          >
            <FiChevronsUp />
          </button>
        )}

        <div className="space-y-3">
          <p className="text-light-subtle dark:text-dark-subtle">{storyLine}</p>
        <div className="h-1 w-25 bg-yellow-500 mr-3" />
        <h2 className="text-2xl font-bold text-white">Detaylar</h2>
        <div className="h-1 w-25 bg-yellow-500 mr-3" />

          <ListWithLabel label="Yönetmenler:">
            <CustomButtonLink
              onClick={() => handleProfileClick(director)}
              label={director.name}
            />
          </ListWithLabel>

          <ListWithLabel label="Senaristler:">
            {writers.map((w) => (
              <CustomButtonLink
                onClick={() => handleProfileClick(w)}
                key={w.id}
                label={w.name}
              />
            ))}
          </ListWithLabel>

          <ListWithLabel label="Başrol:">
            {cast.map(({ id, profile, leadActor }) => {
              return leadActor ? (
                <CustomButtonLink
                  onClick={() => handleProfileClick(profile)}
                  label={profile.name}
                  key={id}
                />
              ) : null;
            })}
          </ListWithLabel>

          <ListWithLabel label="Dil:">
            <CustomButtonLink label={language} clickable={false} />
          </ListWithLabel>

          <ListWithLabel label="Çıkış Tarihi:">
            <CustomButtonLink
              label={convertDate(releseDate)}
              clickable={false}
            />
          </ListWithLabel>

          <ListWithLabel label="Tür:">
            {genres.map((g) => (
              <CustomButtonLink label={g} key={g} clickable={false} />
            ))}
          </ListWithLabel>

          <ListWithLabel label="Kategori:">
            <CustomButtonLink label={type} clickable={false} />
          </ListWithLabel>

          <CastProfiles cast={cast} />
          <RelatedMovies movieId={movieId} />
        </div>
      </Container>

      <ProfileModal
        visible={showProfileModal}
        onClose={hideProfileModal}
        profileId={selectedProfile.id}
      />

      <AddRatingModal
        visible={showRatingModal}
        onClose={hideRatingModal}
        onSuccess={handleOnRatingSuccess}
      />
    </div>
  );
}

const ListWithLabel = ({ children, label }) => {
  return (
    <div className="flex space-x-2">
      <p className="text-light-subtle dark:text-dark-subtle font-semibold">
        {label}
      </p>
      {children}
    </div>
  );
};

const CastProfiles = ({ cast, onProfileClick }) => {
  return (
    <div className="">
      <h1 className="text-light-subtle dark:text-dark-subtle font-semibold text-2xl mb-2">
        Ekip:
      </h1>
      <div className="flex flex-wrap space-x-4">
        {cast.map(({ id, profile, roleAs }) => {
          return (
            <div
              key={id}
              className="basis-28 flex flex-col items-center text-center mb-4"
            >
              <img
                className="w-24 h-24 aspect-square object-cover rounded-full"
                src={profile.avatar}
                alt=""
              />

              <CustomButtonLink label={profile.name} />
              <span className="text-light-subtle dark:text-dark-subtle text-sm">
                rolü
              </span>
              <p className="text-light-subtle dark:text-dark-subtle">
                {roleAs}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
