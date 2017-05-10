import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const VideoChat = props => (
  <div className="static-modal">
    <Modal.Dialog>
      <Modal.Header>
        <Modal.Title>Video Chat</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <video id="remoteVideo"></video>
        <video id="localVideo"></video>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={() => props.closeVideo()}>Close</Button>
      </Modal.Footer>

    </Modal.Dialog>
  </div>
);

export default VideoChat;