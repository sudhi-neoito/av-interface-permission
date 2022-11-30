import React, { useRef } from "react";

import Bowser from "bowser";

import {
  MediaPermissionsError,
  MediaPermissionsErrorType,
  requestMediaPermissions,
} from "mic-check";

const browser = Bowser.getParser(window.navigator.userAgent);

const DialogType = {
  explanation: "explanation",

  systemDenied: "systemDenied",
  userDenied: "userDenied",
  trackError: "trackError",
};

const Dialog = () => {
  const [showDialog, setShowDialog] = React.useState(null);

  const [audioAllowed, setAudioAllowed] = React.useState(false);
  const [videoAllowed, setVideoAllowed] = React.useState(false);

  const [errorDetails, setErrorDetails] = React.useState();

  // Create wrapper refs to access values even during setTimeout
  // https://github.com/facebook/react/issues/14010
  const showDialogRef = useRef(showDialog);
  showDialogRef.current = showDialog;
  const audioAllowedRef = useRef(audioAllowed);
  audioAllowedRef.current = audioAllowed;
  const videoAllowedRef = useRef(videoAllowed);
  videoAllowedRef.current = videoAllowed;

  React.useEffect(() => {
    checkMediaPermissions();
  }, []);

  React.useEffect(() => {
    console.log("audio allowed permission changed: ", audioAllowed);
    if (audioAllowed || videoAllowed) {
      // set the default devices
      // MediaManager.findMediaDevices();
    }
  }, [audioAllowed, videoAllowed]);

  const checkForExplanationDialog = () => {
    if ((!audioAllowedRef.current || !videoAllowedRef.current) && showDialogRef.current === null)
      setShowDialog(DialogType.explanation);
  };

  const checkMediaPermissions = () => {
    // TODO: listen to if there is a change on the audio/video piece?

    requestMediaPermissions()
      .then(() => {
        setAudioAllowed(true);
        setVideoAllowed(true);
        setShowDialog(null);
      })
      .catch((error) => {
        console.log("Dialog: ", error);
        if (error.type === MediaPermissionsErrorType.SystemPermissionDenied) {
          // user denied permission
          setShowDialog(DialogType.systemDenied);
        } else if (error.type === MediaPermissionsErrorType.UserPermissionDenied) {
          // browser doesn't have access to devices
          setShowDialog(DialogType.userDenied);
        } else if (error.type === MediaPermissionsErrorType.CouldNotStartVideoSource) {
          // most likely when other apps or tabs are using the cam/mic (mostly windows)
          setShowDialog(DialogType.trackError);
        } else {
        }
        setErrorDetails(error);
      });

    setTimeout(() => {
      checkForExplanationDialog();
    }, 500);
  };

  const _renderTryAgain = (text) => {
    return (
      <div>
        <button
          className="bg-pink-600 w-10 h-16"
          onClick={() => {
            if (browser.getBrowserName() === "Safari") {
              // If on Safari, rechecking permissions results in glitches so just refresh the page
              window.location.reload();
            } else {
              checkMediaPermissions();
            }
          }}
          color="primary"
          style={{ float: "right" }}>
          {text ? text : "Retry"}
        </button>
      </div>
    );
  };

  const _renderErrorMessage = () => {
    if (!errorDetails) return null;
    return (
      <div>
        <div>
          <div aria-controls="panel1a-content" id="panel1a-header">
            <h1 variant="caption" style={{ color: "red" }}>
              Error Details
            </h1>
          </div>
          <span>
            <h1 variant="caption">
              {errorDetails.name}: {errorDetails.message}
            </h1>
          </span>
        </div>
      </div>
    );
  };

  const _renderExplanationDialog = () => {
    return (
      <div>
        <h1 variant="h5">Allow App to use your camera and microphone</h1>
        <h1 variant="subtitle1">
          App needs access to your camera and microphone so that other participants can see and hear
          you.
        </h1>
      </div>
    );
  };

  const _renderUserDeniedDialog = () => {
    return (
      <div>
        <h1 variant="h5">Camera and microphone are blocked</h1>
        <h1>
          App requires access to your camera and microphone.{" "}
          {browser.getBrowserName() !== "Safari" && (
            <h1>
              Click the camera blocked icon{" "}
              <img
                alt="icon"
                src={
                  "https://www.gstatic.com/meet/ic_blocked_camera_dark_f401bc8ec538ede48315b75286c1511b.svg"
                }
                style={{ display: "inline" }}
              />{" "}
              in your browser's address bar.
            </h1>
          )}
        </h1>
        {_renderErrorMessage()}
        {_renderTryAgain()}
      </div>
    );
  };

  const _renderSystemDeniedDialog = () => {
    const settingsDataByOS = {
      macOS: {
        name: "System Preferences",
        link: "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera",
      },
    };

    return (
      <div>
        <h1 variant="h5">Can't use your camera or microphone</h1>
        <h1>
          Your browser might not have access to your camera or microphone. To fix this problem, open{" "}
          {
            // @ts-ignore
            settingsDataByOS[browser.getOSName()] ? (
              <div
                onClick={() => {
                  window.open(
                    // @ts-ignore
                    settingsDataByOS[browser.getOSName()].link,
                    "_blank"
                  );
                }}>
                {
                  // @ts-ignore
                  settingsDataByOS[browser.getOSName()].name
                }
              </div>
            ) : (
              "Settings"
            )
          }
          .
        </h1>
        {_renderErrorMessage()}
        {_renderTryAgain()}
      </div>
    );
  };

  const _renderTrackErrorDialog = () => {
    return (
      <div>
        <h1 variant="h5">Can't start your camera or microphone</h1>
        <h1>
          Another application (Zoom, Webex) or browser tab (Google Meet, Messenger Video) might
          already be using your webcam. Please turn off other cameras before proceeding.
        </h1>
        {_renderErrorMessage()}
        {_renderTryAgain()}
      </div>
    );
  };

  const _renderDialogContent = () => {
    switch (showDialog) {
      case DialogType.explanation:
        return _renderExplanationDialog();
      case DialogType.systemDenied:
        return _renderSystemDeniedDialog();
      case DialogType.userDenied:
        return _renderUserDeniedDialog();
      case DialogType.trackError:
        return _renderTrackErrorDialog();
    }
  };
  return (
    <div
      className={`${
        !!showDialog ? "bg-yellow-300" : "bg-blue-500"
      } bg-gray-600 w-screen h-screen flex flex-col justify-between items-center`}>
      {showDialog && _renderDialogContent()}
    </div>
  );
};

export { Dialog };
