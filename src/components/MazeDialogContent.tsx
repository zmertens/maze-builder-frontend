import { Maze } from "../maze_builder";
import { DialogContent } from "@mui/material";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";


type DialogFormProps = {
  maze: Maze;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
function MazeDialogContent({ maze, handleChange }: DialogFormProps) {
  return (
    <DialogContent>
        <Stack spacing={2} mt={1}>
      <TextField
        label="File"
        name="file"
        value={maze.file}
        onChange={handleChange}
      />
      <br />
      <TextField
        label="Algorithm"
        name="algorithm"
        value={maze.algorithm}
        onChange={handleChange}
      />
      <br />
      <TextField
        label="Width"
        name="width"
        value={maze.width}
        onChange={handleChange}
      />
      <br />
      <TextField
        label="Length"
        name="length"
        value={maze.length}
        onChange={handleChange}
      />
      <br />
      <TextField
        label="Height"
        name="height"
        value={maze.height}
        onChange={handleChange}
      />
      <br />
      <TextField
        label="Seed"
        name="seed"
        value={maze.seed}
        onChange={handleChange}
      />
      <br />
      </Stack>
    </DialogContent>
  );
}
export default MazeDialogContent;
