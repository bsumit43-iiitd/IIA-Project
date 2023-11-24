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
import { Link } from "react-router-dom";

export default function PortTable({ data }) {
  return (
    <>
      <br />
      <TableContainer component={Paper}>
        <Table  sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell align="right">Trade Date</TableCell>
              <TableCell align="right">Trade Exchange</TableCell>
              <TableCell align="right">Trade Type</TableCell>
              <TableCell align="right">Traded Quantity</TableCell>
              <TableCell align="right">BSE Price</TableCell>
              <TableCell align="right">NSE Price</TableCell>
              <TableCell align="right">Profit/Loss</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length &&
              data.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell scope="row">{row.symbol}</TableCell>
                  <TableCell align="right">{row.trade_date}</TableCell>
                  <TableCell align="right">{row.exchange}</TableCell>
                  <TableCell align="right">{row.trade_type}</TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell align="right">{row.bse}</TableCell>
                  <TableCell align="right">{row.nse}</TableCell>
                  <TableCell align="right">{row.profit}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
