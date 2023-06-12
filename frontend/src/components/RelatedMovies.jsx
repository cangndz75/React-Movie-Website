import React, { useEffect, useState } from "react";
import { getRelatedMovies } from "../api/movie";
import { useNotification } from "../hooks";
import MovieList from "./user/MovieList";

export default function RelatedMovies({ movieId }) {
  const [movies, setMovies] = useState([]);
  const { updateNotification } = useNotification();

  useEffect(() => {
    const fetchRelatedMovies = async () => {
      try {
        const response = await getRelatedMovies(movieId);
        setMovies(response.movies);
      } catch (error) {
        updateNotification("error", error.message);
      }
    };

    if (movieId) {
      fetchRelatedMovies();
    }
  }, [movieId]);

  return <MovieList title="İlgili Filmler" movies={movies} />;
}
