import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addMaze } from "../api/mazeapi";
import { useState } from "react";
import { Maze } from "../maze_builder";
import MazeDialogContent from "./MazeDialogContent";

function AddMaze() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [maze, setMaze] = useState<Maze>({
    file: "",
    algorithm: "",
    width: 0,
    length: 0,
    height: 0,
    seed: 0,
  });

  // Call the addMaze API function
  const { mutate } = useMutation(addMaze, {
    onSuccess: () => {
      queryClient.invalidateQueries(["mazes"]);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaze({ ...maze, [event.target.name]: event.target.value });
  };

  const handleSave = () => {
    mutate(maze);
    setMaze({
      file: "",
      algorithm: "",
      width: 0,
      length: 0,
      height: 0,
      seed: 0,
    });
    handleClose();
  };

  return (
    <>
      <Button onClick={handleClickOpen}>New Maze</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New maze</DialogTitle>
        <MazeDialogContent maze={maze} handleChange={handleChange} />
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AddMaze;
