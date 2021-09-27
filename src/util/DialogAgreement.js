import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";

import "../css/Dialogareement.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogAgreement = ({
  title,
  description,
  open,
  handleClose,
  handleAgree,
  textClose,
  textSubmit,
  hidenBtn,
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle
        // className="dialogareement"
        style={{
          textAlign: "left",
          backgroundImage:
            "linear-gradient(90.04deg, #025074 -2.47%, #01BCC3 104.96%)",
        }}
        id="alert-dialog-slide-title"
      >
        {title}
      </DialogTitle>
      <DialogContent
        style={{
          backgroundImage:
            "linear-gradient(90.04deg, #025074 -2.47%, #01BCC3 104.96%)",
        }}
      >
        <DialogContentText
          style={{
            fontFamily: "mainFont",
            textAlign: "center",
          }}
          id="alert-dialog-slide-description"
        >
          {description}
        </DialogContentText>
      </DialogContent>
      {!hidenBtn && (
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "space-around",
            paddingBottom: "20px",
            backgroundImage:
              "linear-gradient(90.04deg, #025074 -2.47%, #01BCC3 104.96%)",
          }}
        >
          <Button
            style={{
              backgroundColor: "#02BAC2",
              borderRadius: "7px",
              textDecoration: "underline",
              padding: "0 20px 0 20px",
              color: "#ffffff",
            }}
            onClick={handleClose}
          >
            {textClose}
          </Button>
          <Button
            style={{
              backgroundColor: "#02BAC2",
              borderRadius: "7px",
              padding: "0 20px 0 20px",
              textDecoration: "underline",
              color: "#ffffff",
            }}
            onClick={handleAgree}
          >
            {textSubmit}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default DialogAgreement;
