import React from "react";
import Container from "./Container";
import HeroSlideshow from "./user/HeroSlideshow";
import NotVerified from "./user/NotVerified";
import TopRatedMovies from "./user/TopRatedMovies";
import TopRatedTVSeries from "./user/TopRatedTVSeries";
import TopRatedWebSeries from "./user/TopRatedWebSeries";
import TopRatedDocumentary from "./user/TopRatedDocumentary";
export default function Home() {
  return (
    <div className="dark:bg-primary bg-white min-h-screen">
      <Container className="px-2 xl:p-0">
        <NotVerified />
        {/* slider */}
        <HeroSlideshow />
        <div className="space-y-3 py-8">
          <TopRatedMovies />
          <TopRatedWebSeries />
          <TopRatedTVSeries />
          <TopRatedDocumentary />
        </div>
      </Container>
    </div>
  );
}
