import { useState } from "react";
import { Maze, MazeEntry, MazeResponse } from "../maze_builder";
import { updateMaze } from "../api/mazeapi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";

import MazeDialogContent from "./MazeDialogContent";

type FormProps = {
  mazedata: MazeResponse;
};

function EditMaze({ mazedata }: FormProps) {
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

  const { mutate } = useMutation(updateMaze, {
    onSuccess: () => {
      queryClient.invalidateQueries(["mazes"]);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaze({ ...maze, [event.target.name]: event.target.value });
  };

  const handleClickOpen = () => {
    setMaze({
      file: mazedata.file,
      algorithm: mazedata.algorithm,
      width: mazedata.width,
      length: mazedata.length,
      height: mazedata.height,
      seed: mazedata.seed,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    const url = mazedata._links.self.href;
    const mazeEntry: MazeEntry = { maze, url };
    mutate(mazeEntry);
    setMaze({
      file: "",
      algorithm: "",
      width: 0,
      length: 0,
      height: 0,
      seed: 0,
    });
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Edit maze">
        <IconButton onClick={handleClickOpen}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit maze</DialogTitle>
        <MazeDialogContent maze={maze} handleChange={handleChange} />
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default EditMaze;
