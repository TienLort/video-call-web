export interface IGame {
  id: number;
  slug: string;
  name: string;
  price: number;
  ratings_count: number;
  description_raw: string;
  website: string;
  released: string;
  background_image: string;
  developers: {
    name: string;
  }[];
  publishers: {
    name: string;
  }[];
  parent_platforms: {
    platform: {
      id: number;
      slug: string;
      name: string;
    };
  }[];
  platforms: {
    platform: {
      id: number;
      slug: string;
      name: string;
    };
  }[];
  genres: {
    name: string;
  }[];
  short_screenshots: {
    id: number;
    image: string;
  }[];
}

export interface IMovieListType {
  id: number;
  backgroundImg: string;
  cardImg: string;
  description: string;
  subTitle: string;
  title: string;
  titleImg: string;
  type: string;
}

export interface IVideoDataType {
  id: number;
  name: string;
  video: string;
  imageUrl: string;
}

export interface ISearchParams {
  page?: number;
  page_size?: number;
  search?: string;
  dates?: string;
  ordering?: string;
}

export type TScreenshot = {
  id: number;
  image: string;
};

export interface IGameHome {
  id: number;
  createdAt: Date;
  name: string;
  avatar: string;
  price: number;
  percent: number;
}
