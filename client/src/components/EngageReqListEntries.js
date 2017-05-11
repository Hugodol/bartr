import React, { Component } from 'react';
import { Button, ButtonControl, Well } from 'react-bootstrap';
import axios from 'axios';
import swal from 'sweetalert';
import Peer from 'peerjs';
import io from 'socket.io-client';

class EngageReqListEntries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currMessages: [],
      currentEngagement: this.props.currentEngagement,
      constraints: {
        video: true,
        audio: false
      },
      remotePeerId: null,
      peer: null,
      calling: false
    }
    this.setCurrMessages();
  }

  componentDidMount() {
    this.sendPeerId();
    // this.answerCall();
  }

  messageAndId() {
    this.props.fetchMessages(this.state.currMessages);
    this.props.fetchId(this.state.currentEngagement.id);
  }

  setCurrMessages() {
    _.each(this.state.currentEngagement.messages, message => {
      this.state.currMessages = [...this.state.currMessages, message.message]
    });
  }

  engagementCompleted(event, selectedEngagement) {
    event.preventDefault();
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.id_token}
    };
    axios.put(`${API_ENDPOINT}/api/engagements/${selectedEngagement.id}`, {
      where: {
        id: selectedEngagement.id
      }
    }, config)
    .then(data => {
      console.log('Engagement updated! ', data);
      swal({
        title: 'Engagement Complete!',
        text: 'We hope it was a pleasant exerience!',
        confirmButtonText: "Check Past Engagements in the Menu",
        type: 'success'
      })
      this.props.fetchEngagements(data.data);
    })
    .catch(err => {
      console.log('Error with engagementCompleted: ', err);
    })
  }

  videoCall() {
    navigator.mediaDevices.getUserMedia(this.state.constraints)
      .then(stream => {
        let localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
        let call = this.state.peer.call(this.state.remotePeerId, stream);
        call.on('stream', remoteStream => {
          let remoteVideo = document.getElementById('remoteVideo');
          remoteVideo.srcObject = remoteStream;
        });
      })
      .catch(err => console.log(err));
  }

  answerCall() {
    // console.log('in answer call', this.state.peer);
    // this.state.peer.on('call', call => {
    //   console.log('call received');
    //   navigator.mediaDevices.getUserMedia(this.state.constraints)
    //   .then(stream => {
    //     let localVideo = document.getElementById('localVideo');
    //     localVideo.srcObject = stream;
    //     call.answer(stream);
    //     call.on('stream', remoteStream => {
    //       let remoteVideo = document.getElementById('remoteVideo');
    //       remoteVideo.srcObject = remoteStream;
    //     });
    //     this.props.openVideo();
    //   })
    //   .catch(err => console.log('Failed to get local stream' ,err));
    // });
  }

  sendPeerId() {
    const socket = io('http://localhost:5000');
    const peer = new Peer({key: 'ghwfzjto973krzfr'});

    this.setState({peer: peer});

    let peerId;
    peer.on('open', id => {
      peerId = id;
      console.log('your peer id is', peerId);
      socket.emit('join', {name: this.state.currentEngagement.id});
      socket.emit('sendId', {
        name: this.state.currentEngagement.id,
        peerId: peerId
      });
      socket.on('fetchPeerId', data => {
        if (data !== peerId) {
          this.setState({remotePeerId: data});
        }
      });
    });

    peer.on('call', call => {
      console.log('call received');
      navigator.mediaDevices.getUserMedia(this.state.constraints)
      .then(stream => {
        let localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
        call.answer(stream);
        call.on('stream', remoteStream => {
          let remoteVideo = document.getElementById('remoteVideo');
          remoteVideo.srcObject = remoteStream;
        });
        this.props.openVideo();
      })
      .catch(err => console.log('Failed to get local stream', err));
    });
  }

  render() {
    {this.state.remotePeerId ? console.log('remote id', this.state.remotePeerId) : null}
    return(
      <Well className="engagementlistentry">
        <Well onClick={() => this.messageAndId() } className="engagementlistentry">
            <div className="engagementlistentry">Reciever Name: {this.state.currentEngagement.receiver.name}<br/>
            Sender Name: {this.state.currentEngagement.sender.name}</div>
            <br/>
        </Well>
        <br/>
        <Button value={this.state.currentEngagement} onClick={() => {this.engagementCompleted(event, this.state.currentEngagement)}} bsStyle="primary">Completed?</Button>
        {this.state.remotePeerId ? (
          <Button
            className="videoChatButton"
            onClick={
              () => {
                this.props.openVideo();
                this.videoCall();
              }
            }
          >Video</Button>
        ) : <Button disabled>Video</Button>}
        <Button
          onClick={
            () => {
              // this.answerCall();
              // this.props.openVideo();
            }
          }
        >Answer</Button>
      <br/>
    </Well>
    )
  }
}

  // currMessages = [...props.msgs, ...currMessages];

  // const postReview = () => {
  //   const config = {
  //     headers: {'Authorization': 'Bearer ' + localStorage.id_token}
  //   };
  //   axios.post(API_ENDPOINT + '/api/reviews', config)
  //        .then(data => {
  //          console.log(data)
  //        })
  // }

export default EngageReqListEntries

// Add feature to write reviews from the sweetalert
