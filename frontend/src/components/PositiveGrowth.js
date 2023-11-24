import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function PositiveGrowth({ data }) {
  return (
    <>
      <br />
      <TableContainer component={Paper}>
        <Table size="small" sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell align="right">Growth (BSE)</TableCell>
              <TableCell align="right">Growth (NSE)</TableCell>
              <TableCell align="right">Average Growth</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length &&
              data.map((row) => (
                <TableRow
                  key={row.company_name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell  scope="row">
                    {row.company_name}
                  </TableCell>
                  <TableCell align="right">{row.bseGrowth}</TableCell>
                  <TableCell align="right">{row.nseGrowth}</TableCell>
                  <TableCell align="right">
                    {(row.bseGrowth + row.nseGrowth).toFixed(2) / 2}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
