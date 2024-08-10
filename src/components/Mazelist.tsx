import { MazeResponse } from "../maze_builder";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import { getMazes, deleteMaze } from "../api/mazeapi";
import AddMaze from "./AddMaze";
import EditMaze from "./EditMaze";
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";


function Mazelist() {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate } = useMutation(deleteMaze, {
    onSuccess: () => {
      // Maze deleted
      setOpen(true);
      queryClient.invalidateQueries({ queryKey: ["mazes"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const columns: GridColDef[] = [
    { field: "brand", headerName: "Brand", width: 200 },
    { field: "model", headerName: "Model", width: 200 },
    { field: "color", headerName: "Color", width: 200 },
    { field: "registrationNumber", headerName: "Reg.nr.", width: 150 },
    { field: "modelYear", headerName: "Model Year", width: 150 },
    { field: "price", headerName: "Price", width: 150 },
    {
      field: "edit",
      headerName: "",
      width: 90,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridCellParams) => <EditMaze mazedata={params.row} />,
    },
    {
      field: "delete",
      headerName: "",
      width: 90,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridCellParams) => (
        <IconButton
          aria-label="delete"
          size="small"
          onClick={() => {
            if (
              window.confirm(
                `Are you sure you want to delete ${params.row.brand} ${params.row.model}?`
              )
            ) {
              mutate(params.row._links.Maze.href);
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const { data, error, isSuccess } = useQuery({
    queryKey: ["mazes"],
    queryFn: getMazes,
  });

  if (!isSuccess) {
    return <span>Loading . . .</span>;
  } else if (error) {
    return <span>Error when fetching Mazes!!</span>;
  } else {
    return (
      <>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <AddMaze />
        </Stack>
        <DataGrid
          rows={data as MazeResponse[]}
          columns={columns}
          getRowId={(row) => row._links.self.href}
          disableRowSelectionOnClick={true}
          slots={{ toolbar: GridToolbar }}
        />
        <Snackbar
          open={open}
          autoHideDuration={2000}
          onClose={() => setOpen(false)}
          message="Maze deleted"
        />
      </>
    );
  }

  return <></>;
}
export default Mazelist;
