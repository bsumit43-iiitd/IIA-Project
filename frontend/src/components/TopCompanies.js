import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from 'react-router-dom';

export default function TopCompanies({ data }) {
  return (
    <>
      <br />
      <TableContainer component={Paper}>
        <Table size="small" sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell align="right">Moving Average (BSE)</TableCell>
              <TableCell align="right">Moving Average (NSE)</TableCell>
              <TableCell align="right">Average Percentage Difference</TableCell>
              <TableCell align="right">View More</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length &&
              data.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell scope="row">{row._id}</TableCell>
                  <TableCell align="right">{row.bse}</TableCell>
                  <TableCell align="right">{row.nse}</TableCell>
                  <TableCell align="right">{row.diffPercentage}</TableCell>
                  <TableCell align="right">
                    <Link to ={"/analysis?id="+row._id}>
                    <IconButton
                      onClick={() => {
                        // setOpenRecipeInfoModal(true);
                        // setID(row?.Recipe_id);
                      }}
                      type="button"
                      sx={{ p: "4px" }}
                    >
                      <VisibilityIcon align="center" fontSize="small" />
                    </IconButton>
                    </Link>
                   
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
