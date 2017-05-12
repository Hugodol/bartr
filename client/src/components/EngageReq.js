import React from 'react';
import axios from "axios";
import { Link } from 'react-router';
import _ from "lodash"
import EngageReqList from "./EngageReqList";
import Chat from "./Chat";
import {Modal, FormGroup, InputGroup, FormControl, Glyphicon, Button} from 'react-bootstrap';

class EngageReq extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      request: false,
      currentEngagement: [],
      messages: [],
      id : null,
      // videoModal: false
    }
      this.fetchMessages = this.fetchMessages.bind(this);
      this.fetchCurrentEngagement = this.fetchCurrentEngagement.bind(this);
      this.fetchEngagements = this.fetchEngagements.bind(this);
      this.fetchCurrentId = this.fetchCurrentId.bind(this);
      this.fetchChatMessages = this.fetchChatMessages.bind(this);
      this.showModal = this.showModal.bind(this);
      this.handleClose = this.handleClose.bind(this);
      clearInterval(window.updates);
  }

  componentDidMount () {
    this.fetchCurrentEngagement();
  }

  fetchCurrentEngagement() {
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.id_token}
    };
    axios.get(API_ENDPOINT + "/api/engagements", config)
    .then(res => {
      _.each(res.data, data =>{
        this.setState({currentEngagement: [...this.state.currentEngagement, data]})
      })
    })
    .catch(err =>{
        console.log("Error fetchCurrentEngagement", err);
    })
  }

  showModal() {
    console.log("INSIDE SHOW MODAL ON ENGAGE REQ");
    this.setState({show: true});
  }

  fetchCurrentId(selectedEngageId) {
    this.setState({id: selectedEngageId})
  }

  fetchMessages(msgs) {
    this.setState({messages: msgs})
  }

  fetchEngagements(eng) {
    let completed;
    _.each(this.state.currentEngagement, (engagements, index) => {
      _.each(engagements, (value, key) => {
        value === eng.id ? completed = index : null
      })
    })
    this.state.currentEngagement.splice(completed, 1);
    this.setState({currentEngagement: this.state.currentEngagement});
  }

  fetchChatMessages(chatMsg) {
    this.setState({messages:[chatMsg, ...this.state.messages]})
  }

  // closeVideo() {
  //   this.setState({ videoModal: false });
  // }

  // openVideo() {
  //   this.setState({ videoModal: true });
  // }

  handleClose(e) {
    e.preventDefault();
    console.log("HANDLE CLOSE");
    this.setState({ show: false });
  }

  requestPayment() {
    this.setState({request: true});
  }

  handleInput(e) {
    e.preventDefault();
    this.setState({invoiceAmount: e.target.value});
  }

  render() {
    return(
      <div >
        <h2
          className="title"
          style={{fontFamily: 'Ubuntu', fontWeight: "normal"}}
        >Current Engagements </h2>
        <EngageReqList
          showModal={this.showModal}
          msgs={this.state.messages}
          currentEngagement={this.state.currentEngagement}
          fetchEngagements={this.fetchEngagements}
          fetchId={this.fetchCurrentId}
          fetchMessages={this.fetchMessages}
        />
        <Chat
          request={this.state.request}
          invoiceAmount={this.state.invoiceAmount}
          id={this.state.id}
          fetchChatMessages={this.fetchChatMessages}
          messages={this.state.messages}
          currentEngagement={this.state.currentEngagement}
        />
      
        <Modal
              {...this.props}
              show={this.state.show}
              dialogClassName="custom-modal"
            >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-lg">Request Payment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Enter the amount in BTC you would like to request:</p>
              <FormGroup>
                <InputGroup onChange={(e) => {this.handleInput(e) }}>
                  <FormControl type="text"/>
                    <InputGroup.Addon>
                      <Glyphicon glyph="bitcoin" />
                    </InputGroup.Addon> 
                </InputGroup>
                <br />
              </FormGroup>
             </Modal.Body>
             <Modal.Footer>
               <Button onClick={(e) => {this.handleClose(e);}}>Cancel</Button>
               <Button onClick={(e) => {this.handleClose(e); this.requestPayment(e)}}>Submit Request</Button>
             </Modal.Footer>
            </Modal>
      </div>
    )
  }
}

export default EngageReq;

