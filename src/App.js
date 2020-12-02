/* Demo for FinTech@SG Course 
Generation of Charts Based on JSON data from Server
Author: Prof Bhojan Anand */
//Install d3.js:   npm install d3 --save
import React from "react";
import logo from "./fs-Logo.png";
import * as d3 from 'd3' 

import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      customers: [],
      data: [],
      transactions: [],
      accountsClicked: false,
      expensesClicked: false};
  }

  callAPIServer() {
    // when component mounted, start a GET request
    // to specified URL
    // fetch("https://f92c6b35-d121-4c8a-987b-81217155297f.mock.pstmn.io/accounts")
    fetch("http://localhost:8000/accounts")
    .then(res => res.json())
    .then(res => this.setState({ data: res }))
    .catch(err => err);

    // fetch("https://f92c6b35-d121-4c8a-987b-81217155297f.mock.pstmn.io/customers")
    fetch("http://localhost:8000/users")
    // when we get a response map the body to json
    .then(res => res.json())
    // and update the state data to said json
    .then(res => this.setState({ customers: res }));

    // transactions
    // fetch("https://f92c6b35-d121-4c8a-987b-81217155297f.mock.pstmn.io/transactions")
    fetch("http://localhost:8000/transactions")
      .then(res => res.json())
      .then(res => this.setState({ transactions: res }))
      .catch(err => err);
  }
  
  componentDidMount() {
    // react lifecycle method componentDidMount()
    //will execute the callAPIserver() method after the component mounts.
    this.callAPIServer();
  }

  componentDidUpdate() {
  
    // /* prepare data */
    // this.state.data.forEach(function (d) {
    //   d.balance = d.balance.replace(/[^0-9.-]+/g,"");  //regular expression to convert currency to Numeric form
    // });

    // this.state.transactions.forEach((d) => {
    //   d.amount = d.amount.replace(/[^0-9.]+/g,"");
    // });
    
    // this.generateGraph();  //based on previous d3.js exampls
    // this.showChart();  //improved version way to chart
    // this.transactions(); when the component updates, calls function

  } 

showChart = () => {

  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  var width = 800 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
  
  var svg = d3
      .select("#visualisation")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  
  svg.selectAll("*").remove();

  var x = d3.scaleBand().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain(this.state.data.map(details => details.account_type));
  y.domain([0, d3.max(this.state.data.map(details => details.balance))]);



  svg.selectAll(".bar")
    .data(this.state.data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.account))
    .attr("width", x.bandwidth() - 10)
    .attr("y", d => y(d.balance))
    .attr("height", d => height - y(d.balance));

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))

    svg.append("g")
      .call(d3.axisLeft(y));
  }

  transactions = () => { 
    const margin = { top: 24, right: 24, bottom: 24, left: 24 };
    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    
    var svg = d3
    .select("#visualisation")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    var radius = Math.min(width, height) / 2;

    var trans = this.state.transactions

    var transactions_data = Object.values(trans.reduce((c, {transaction_type,amount}) => {
      c[transaction_type] = c[transaction_type] || {transaction_type,amount: 0};
      c[transaction_type].amount += parseInt(amount);
      return c;
    }, {}));

    //The <g> SVG element is a container used to group other SVG elements.
    var g = svg.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // set the color scale  
    var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "#394867"]);

    // Compute the position of each group on the pie:   
    var pie = d3.pie()
        .value(function(d) { 
          return d.amount; 
      });

    //radius for the arc   
    var path = d3.arc()
          .outerRadius(radius - 10)
          .innerRadius(0);
    
    //radius for the label      
    var label = d3.arc()
          .outerRadius(radius).innerRadius(radius - 80);
        
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    var arc = g.selectAll(".arc")
        .data(pie(transactions_data))
        .enter()
        .append("g")
        .attr("class", "arc");
    
    var arc2 = g.selectAll(".arc2")
        .data(pie(transactions_data))
        .enter()
        .append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) { return color(d.data.amount); });

        //console.log(arc);
  
    arc2.append("text").attr("transform", function(d) { 
        return "translate(" + label.centroid(d) + ")"; 
    })
          
          .text(function(d) { return d.data.transaction_type; });
          
  };

  clickAccounts = () => {
    this.setState({ accountsClicked: true });
    this.showChart();
  }

  clickExpenses = () => {
    this.setState({ expensesClicked: true });
    this.transactions();
  };


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="flex-between">
            <img src={logo} className="App-logo" alt="logo" />
            <div className="App-title">FSB</div>
          </div>
          <div>
            <button disabled = {this.state.accountsClicked ? true : false } onClick= {this.clickAccounts}>Accounts</button>
            <button disabled = {this.state.expensesClicked ? true : false } onClick= {this.clickExpenses}>Expenses</button>
          </div>
        </header>
        <div className="container">
          <div id="visualisation">
          </div>
        
        <h2>Customer Information</h2>
        <table className="myTable">
          <tbody>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
            </tr>
              {(this.state.customers).map((item) => {
              return (
                <tr key={item.id}>         
                      <td> {item.user_id} </td>
                      <td> {item.name} </td>
                      <td> {item.email}  </td>
                      <td> {item.mobile} </td>
                </tr>
              );
              })} 
          </tbody>
        </table>

        <h2>Accounts Information</h2>
          <table className="myTable">
            <tbody>
              <tr>
                <th>ID</th>
                <th>Account Type</th>
                <th>Balance</th>
                <th>Limit</th>
                <th>Date</th>
              </tr>
            {this.state.data.map((item) => {
              return (
                <tr key={item.account_number}>
                  <td> {item.user_id} </td>
                  <td> {item.account_type} </td>
                  <td> {item.balance} </td>
                  <td> {item.max_limit} </td>
                  <td> {item.date_created} </td>
                </tr>
              );
            })}
            </tbody>
          </table>
      </div>
    </div>
    );
  };
};

export default App;
