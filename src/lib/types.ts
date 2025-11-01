export type ReccomendationsData = {
  id: number;
  name: string | null;
  email: string | null;
  avatar: string | null;
  mutualFriendCount: number;
  mutualFriends: {
    id: number;
    name: string | null;
  }[];
};

export type SearchResult = {
  id: number;
  name: string | null;
  avatar: string | null;
};
