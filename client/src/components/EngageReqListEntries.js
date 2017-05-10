import React, { Component } from 'react';
import { Button, ButtonControl, Well } from 'react-bootstrap';
import axios from 'axios';
import swal from 'sweetalert';



const EngageReqListEntries = (props) => {
  let currMessages = [];
  let currentEngagement = props.currentEngagement;
  const constraints = {
    video: true,
    audio: false
  }

  _.each(currentEngagement.messages, message => {
    currMessages = [...currMessages, message.message]
  })

  const messageAndId = () => {
    props.fetchMessages(currMessages);
    props.fetchId(currentEngagement.id);
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

  const engagementCompleted = (event, selectedEngagement) => {
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
      props.fetchEngagements(data.data);
    })
    .catch(err => {
      console.log('Error with engagementCompleted: ', err);
    })
  }

  const videoCall = () => {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        console.log('stream in videoCall', stream);
        let localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
      })
      .catch(err => console.log(err));

  };

  return(
    <Well className="engagementlistentry">
      <Well onClick={() => messageAndId() } className="engagementlistentry">
          <div className="engagementlistentry">Reciever Name: {currentEngagement.receiver.name}<br/>
          Sender Name: {currentEngagement.sender.name}</div>
          <br/>
      </Well>
      <br/>
      <Button value={currentEngagement} onClick={() => {engagementCompleted(event, currentEngagement)}} bsStyle="primary">Completed?</Button>
      <Button onClick={
        () => {
          props.openVideo();
          videoCall();
        }
      }>Video</Button>
    </Well>
  )
}

export default EngageReqListEntries

// Add feature to write reviews from the sweetalert