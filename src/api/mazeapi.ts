import axios from "axios";
import { Maze, MazeResponse, MazeEntry } from "../maze_builder";

const API_URL = "https://Mazebuilder-env-1.eba-8z5uxtbj.us-east-2.elasticbeanstalk.com";

export const getMazes = async (): Promise<MazeResponse[]> => {
  const response = await axios.get(`${API_URL}/api/mazes`);
  return response.data._embedded.Mazes;
};

export const deleteMaze = async (link: string): Promise<MazeResponse> => {
  const response = await axios.delete(link);
  return response.data;
};

export const addMaze = async (Maze: Maze): Promise<MazeResponse> => {
  const response = await axios.post(
    `${API_URL}/api/mazes`,
    Maze
  );
  return response.data;
};

export const updateMaze = async (
  MazeEntry: MazeEntry
): Promise<MazeResponse> => {
  const response = await axios.put(MazeEntry.url, MazeEntry.maze);

  return response.data;
};
