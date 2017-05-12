import React, { Component } from 'react';
import { Button, ButtonControl, Well, Glyphicon } from 'react-bootstrap';
import axios from 'axios';
import swal from 'sweetalert';
import Peer from 'peerjs';
import io from 'socket.io-client';
import VideoChat from './VideoChat.js';

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
      calling: false,
      videoModal: false,
      socket: null,
      stream: null
    }
    this.setCurrMessages();
    this.closeVideo = this.closeVideo.bind(this);
    this.openVideo = this.openVideo.bind(this);
  }

  componentDidMount() {
    this.sendPeerId();
    console.log('List entry mounted');
  }

  componentWillUnmount() {
    this.state.socket.emit('leave',
      {name: this.state.currentEngagement.id}
    );
    // this.state.remotePeerId = null;
    // this.state.peer = null;
    // this.state.socket = null;
    console.log('List entry unmounted');
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
    console.log('peer', this.state.peer);
    // if (!this.state.peer) {
    //   this.sendPeerId();
    // }
    navigator.mediaDevices.getUserMedia(this.state.constraints)
      .then(stream => {
        this.setState({stream: stream});
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

  sendPeerId() {
    const socket = io('http://localhost:5000');
    // const socket = io();
    const peer = new Peer({key: PEERS_API_KEY});

    this.setState({peer: peer});
    this.setState({socket: socket});

    let peerId;
    peer.on('open', id => {
      peerId = id;
      console.log('your peer id is', peerId);
      socket.emit('join', {name: this.state.currentEngagement.id});
      socket.emit('sendId', {
        name: this.state.currentEngagement.id,
        peerId: peerId
      });
      socket.on('userLeft', () => {
        this.setState({remotePeerId: null});
      });
      socket.on('fetchPeerId', data => {
        if (data !== peerId) {
          this.setState({remotePeerId: data});
        }
        if (!this.state.remotePeerId) {
          socket.emit('sendId', {
            name: this.state.currentEngagement.id,
            peerId: peerId
          });
        }
      });
    });

    peer.on('call', call => {
      let context = this;
      swal({
        title: 'Someone is calling you!',
        text: "Accept call?",
        showCancelButton: true,
        confirmButtonColor: "#337AB7",
        confirmButtonText: "Accept",
        closeOnConfirm: true
      },
      function(){
        navigator.mediaDevices.getUserMedia(context.state.constraints)
        .then(stream => {
          context.setState({stream: stream});
          context.openVideo();
          let localVideo = document.getElementById('localVideo');
          localVideo.srcObject = stream;
          call.answer(stream);
          call.on('stream', remoteStream => {
            let remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.srcObject = remoteStream;
          });
        })
        .catch(err => console.log('Failed to get local stream', err));
      });
    });
  }

  closeVideo() {
    this.setState({ videoModal: false });
    this.state.peer.destroy();
    this.state.stream.getTracks()[0].stop();
  }

  openVideo() {
    this.setState({ videoModal: true });
  }

  render() {
    return(
      <Well className="engagementlistentry">
        <Well onClick={() => this.messageAndId() } className="engagementlistentry">
            <div className="engagementlistentry">Reciever Name: {this.state.currentEngagement.receiver.name}<br/>
            Sender Name: {this.state.currentEngagement.sender.name}</div>
            <br/>
        </Well>
        <br/>
        <Button value={this.state.currentEngagement} onClick={() => {this.engagementCompleted(event, this.state.currentEngagement)}} bsStyle="primary">Completed?</Button>
        <Button onClick={this.props.showModal}>Request Payment</Button>
        {this.state.remotePeerId ? (
          <Button
            className="videoChatButtonOn"
            onClick={
              () => {
                this.openVideo();
                this.videoCall();
              }
            }
          ><Glyphicon glyph="facetime-video" /></Button>
        ) : <Button className="videoChatButtonOff" disabled><Glyphicon glyph="facetime-video" /></Button>}

      <br/>
      {this.state.videoModal ?
          <VideoChat closeVideo={this.closeVideo}/>
        : null}
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
