import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { Button} from 'semantic-ui-react';
import { PageHeader, Modal, FormGroup, InputGroup, Glyphicon, FormControl } from 'react-bootstrap';
import axios from 'axios';
import './styles/userProfileStyles.css';
var QRCode = require('qrcode.react');
import QrReader from 'react-qr-reader'

class UserProfile extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      name: '',
      address: '',
      service: '',
      lat: '',
      lng: '',
      listOfServices: [],
      balance: 0,
      withdrawAddress: '',
      modalOpen: false,
      qrValue: '',
    }

    this.fetchUser = this.fetchUser.bind(this);
    this.fetchScore = this.fetchScore.bind(this);
    this.loadMap = this.loadMap.bind(this);
    this.handleWithdraw = this.handleWithdraw.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleAddressEntry = this.handleAddressEntry.bind(this);
    this.scanQR = this.scanQR.bind(this);
    this.handleScan = this.handleScan.bind(this);
    this.updateTicker = this.updateTicker.bind(this);
    this.sendFinancialDataEmail = this.sendFinancialDataEmail.bind(this);
  }

  componentDidMount() {
    this.getServices();
    this.fetchUser();
    window.updates = setInterval(() => { this.updateTicker(); this.updateBalance()}, 10000);
  }

  componentWillUnmount() {
    clearInterval(window.updates);
  }

  sendFinancialDataEmail(){
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
                'Content-Type': 'application/json' }
    }

    axios.post(API_ENDPOINT + '/api/emails/send', {
      btcAmount: this.state.balance,
      dollarAmount: this.state.USD,
      email: this.state.email,
      name: this.state.name
    }, config)
    .then((data) => {
      console.log("Send the email to " + this.state.name + " at " + this.state.email + ". DATA IS: ", data);
    })
    .catch((error) => {
      console.log("Couldn't Send the email to " + this.state.name + " at " + this.state.email + ". ERROR IS: ", error);
    });
  }

  fetchScore() {
    axios.get(API_ENDPOINT + '/api/users')
  }

  getServices() {
    axios.get(API_ENDPOINT + '/api/services')
      .then(result => {
        _.each(result.data, service => {
          this.setState({
            listOfServices: this.state.listOfServices.concat([{text: service.type, value: service.id, key: service.id}])
          })
        })
      })
      .catch(err => {
        console.log('Error loading listOfServices: ', err);
      })
  }

  fetchUser() {
    let auth = JSON.parse(localStorage.profile).user_id
    const config = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.id_token
      }
    }
    axios.get(API_ENDPOINT + `/api/users/${auth}`, config)
      .then((res) => {
        // console.log('RES IN FETCH USER', res.data);
        let userService = null;
        _.each(this.state.listOfServices, (service) => {
          if (service.value === res.data.service_id) {
            userService = service.text;
          }
        })
        axios.get("https://blockchain.info/q/addressbalance/" + res.data.public_key +  "?confirmations=0&cors=true").then(balance => {
          axios.get("http://api.coindesk.com/v1/bpi/currentprice/usd.json").then(tickers => {
            this.setState({...this.state,
              name: res.data.name,
              address: res.data.address,
              email: res.data.email,
              service: userService,
              lat: res.data.geo_lat,
              lng: res.data.geo_lng,
              wallet: res.data.public_key,
              p: res.data.private_key,
              balance: balance.data / Math.pow(10, 8),
              rawBalance: balance.data,
              USD: (balance.data / Math.pow(10, 8) * Number(tickers.data.bpi.USD.rate.split(",").join(""))).toString().slice(0,4)
            })
          })

        })
        this.loadMap();
      })
      .catch(err => {
        console.log('Error in fetchUsers in UserProfile: ', err);
      })
  }

  updateTicker() {
    console.log("INSIDE UPDATE TICKER");
    axios.get("http://api.coindesk.com/v1/bpi/currentprice/usd.json").then(tickers => {
      if ((Number(tickers.data.bpi.USD.rate.split(",").join("")) * this.state.balance).toString().slice(0,4) !== this.state.USD) {
        this.setState({USD: (Number(tickers.data.bpi.USD.rate.split(",").join("")) * this.state.balance).toString().slice(0,4)});
      }
    })
  }

  updateBalance() {
    console.log("INSIDE UPDATE BALANCE");
    axios.get("https://blockchain.info/q/addressbalance/" + this.state.wallet +  "?confirmations=0&cors=true").then(balance => {
          if (this.state.rawBalance !== balance.data) {
            this.setState({balance: balance.data / Math.pow(10, 8)});
          }
        });
  }

  loadMap() {
    const homeUrl = "https://cdn3.iconfinder.com/data/icons/map-markers-1/512/residence-512.png";
      const google = window.google;
      const maps = google.maps;

      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);

      let zoom = 15;
      const center = new maps.LatLng(this.state.lat, this.state.lng);
      const mapConfig = Object.assign({}, {
        center: center,
        zoom: zoom
      })
      this.map = new maps.Map(node, mapConfig);
      this.googleMap = this.map

      const home = {
        url: homeUrl,
        scaledSize: new google.maps.Size(40,40),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(20,20)
      }
      const marker = new maps.Marker({
        map: this.map,
        draggable: false,
        animation: maps.Animation.DROP,
        position: center,
        icon: home,
        title: "Your Location"
      })
      marker.setMap(this.map);
  }
  handleWithdraw(e) {
    e.preventDefault();
    console.log("In handleWithdraw address is", this.state.withdrawAddress);
    const config = {
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
                'Content-Type': 'application/json' }
    };
    axios.post(API_ENDPOINT + '/api/transactions/create', {"public_key": this.state.wallet, "fromWIF": this.state.p, "toAddress": this.state.withdrawAddress}, config).then(data => {
      this.render();
    });
    this.sendFinancialDataEmail();
  }

  handleOpen(e) {
    e.preventDefault();
    this.setState({show: true})
  }

  handleClose(e) {
    e.preventDefault();
    this.setState({show: false})
  }
  handleAddressEntry(e) {
    e.preventDefault();
    this.setState({withdrawAddress: e.target.value});
  }
  scanQR(e) {
    e.preventDefault();
    this.setState({showScanner: true});
  }
  handleScan(result) {
    console.log("INSIDE HANDLE SCAN RESULT IS", result);
    if (result) {
      var qIndex = result.indexOf("?");
      if(qIndex > -1) {
        result = result.slice(0, qIndex);
      }
      if(result[0] === 'b') {
        result = result.slice(8);
      }
      this.setState({showScanner: false, qrValue: result, withdrawAddress: result})
      console.log(this.state);
    }
  }

  render() {
    return(
      <div className='body'>
        <div className="profile-page-content">
          <div className="user-profile-page card">
            <div className="user-profile-img">
              {/*<img className="bg-top" src="http://www.petsprin.com/i/2016/12/high-resolution-wallpaper-city-wallpaper-picture.jpg" />*/}
              <img className="avatar" src={this.props.profile.picture_large ? this.props.profile.picture_large : 'http://donatered-asset.s3.amazonaws.com/assets/default/default_user-884fcb1a70325256218e78500533affb.jpg'}/>
            </div>
            <div className="user-profile-info">
              <h1 className="name">{this.state.name}</h1>
              <p className="service">{this.state.service ? this.state.service : null}</p>
              <p className="wallet"><b>Wallet address:</b> {this.state.wallet}</p>
              {this.state.wallet ? (<QRCode size="256" value={this.state.wallet} />) : <div></div>}
              <p className="balance"><b>Balance:</b> {this.state.balance} BTC</p>
              <p className="balanceUSD"><b>USD:</b> ${this.state.USD}</p>
            </div>
            <div className="address">{this.state.address ? this.state.address : null}</div>
            <Link to='/editprofile'><button>Edit Profile</button></Link>
            <button onClick={this.handleOpen}>Withdraw Funds</button>
            <Modal
              {...this.props}
              show={this.state.show}
              onHide={this.hideModal}
              dialogClassName="custom-modal"
            >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-lg">Withdraw Funds</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Enter the bitcoin address you would like to withdraw funds to:</p>
              <p>Your balance must be at least $3 USD to withdraw.</p>

              <FormGroup>
                <InputGroup onChange={this.handleAddressEntry}>
                  <FormControl type="text" placeholder={this.state.qrValue}/>
                    <InputGroup.Addon>
                      <Glyphicon glyph="bitcoin" />
                    </InputGroup.Addon>
                </InputGroup>
                <br />
                {this.state.showScanner ? (<QrReader
                      onScan={this.handleScan}

                     maxImageSize={3000}
                     />) : <div></div>}
              </FormGroup>
             </Modal.Body>
             <Modal.Footer>
               <Button onClick={(e) => {this.handleClose(e);}}>Cancel</Button>
               <Button onClick={(e) => {this.scanQR(e);}}>Scan From QR Code</Button>
               <Button onClick={(e) => {this.handleClose(e); this.handleWithdraw(e)}}>Submit Withdrawal</Button>
             </Modal.Footer>
            </Modal>
          </div>
          <div className="google-maps" ref="map"/>
        </div>
      </div>
    )
  }
}

export default UserProfile;

// http://allswalls.com/images/hdr-nature-background-wallpaper-3.jpg
