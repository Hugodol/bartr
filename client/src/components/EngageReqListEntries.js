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
      }
    }
    this.setCurrMessages();
  }

  componentDidMount() {
    this.sendPeerId();
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
        console.log('stream in videoCall', stream);
        let localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
      })
      .catch(err => console.log(err));
  }

  sendPeerId() {
    const socket = io();
    const peer = new Peer({key: 'ghwfzjto973krzfr'});

    let peerId;
    peer.on('open', id => {
      peerId = id;
      socket.emit('join', {name: this.currentEngagement.id});
      socket.emit('sendId', {
        name: this.currentEngagement.id,
        peerId: peerId
      });
      socket.on('fetchPeerId', data => {
        this.setState({remotePeerId: data});
      });
    });
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
        <Button onClick={
          () => {
            this.props.openVideo();
            this.videoCall();
          }
        }>Video</Button>
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