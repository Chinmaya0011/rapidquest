import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { fetchShopifyCustomers, fetchShopifyOrders } from '../services/Api'; // Adjust the import path if necessary

const Charts = () => {
  const [salesData, setSalesData] = useState({ daily: [], monthly: [], quarterly: [], yearly: [] });
  const [salesGrowthRate, setSalesGrowthRate] = useState([]);
  const [newCustomers, setNewCustomers] = useState([]);
  const [repeatCustomers, setRepeatCustomers] = useState([]);
  const [customerGeoData, setCustomerGeoData] = useState([]);
  const [customerLifetimeValue, setCustomerLifetimeValue] = useState([]);

  const fetchData = async () => {
    try {
      const orders = await fetchShopifyOrders();
      const customers = await fetchShopifyCustomers();

      const processedSalesData = processSalesData(orders);
      setSalesData(processedSalesData);

      const processedSalesGrowthRate = calculateSalesGrowthRate(orders);
      setSalesGrowthRate(processedSalesGrowthRate);

      const processedNewCustomers = calculateNewCustomers(customers);
      setNewCustomers(processedNewCustomers);

      const processedRepeatCustomers = calculateRepeatCustomers(customers);
      setRepeatCustomers(processedRepeatCustomers);

      const processedCustomerGeoData = calculateCustomerGeoData(customers);
      setCustomerGeoData(processedCustomerGeoData);

      const processedCustomerLifetimeValue = calculateCustomerLifetimeValue(customers, orders);
      setCustomerLifetimeValue(processedCustomerLifetimeValue);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (salesData.daily.length) drawSalesChart(salesData.daily);
    if (salesGrowthRate.length) drawSalesGrowthRateChart(salesGrowthRate);
    if (newCustomers.length) drawNewCustomersChart(newCustomers);
    if (repeatCustomers.length) drawRepeatCustomersChart(repeatCustomers);
    if (customerGeoData.length) drawCustomerGeoChart(customerGeoData);
    if (customerLifetimeValue.length) drawCustomerLifetimeValueChart(customerLifetimeValue);
  }, [salesData, salesGrowthRate, newCustomers, repeatCustomers, customerGeoData, customerLifetimeValue]);

  // Chart drawing functions
  const drawSalesChart = (data) => {
    const svg = d3.select('#salesChart');
    svg.selectAll('*').remove();

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total)])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.total))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.total))
      .attr('fill', 'steelblue')
      .attr('class', 'bar')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(200).attr('fill', 'orange');
        svg.append('text')
          .attr('id', 'tooltip')
          .attr('x', xScale(d.date) + xScale.bandwidth() / 2)
          .attr('y', yScale(d.total) - 10)
          .attr('text-anchor', 'middle')
          .text(`$${d.total}`);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('fill', 'steelblue');
        d3.select('#tooltip').remove();
      });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Daily Sales')
      .attr('class', 'chart-title');
  };

  const drawSalesGrowthRateChart = (data) => {
    const svg = d3.select('#salesGrowthRateChart');
    svg.selectAll('*').remove();

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.growthRate)])
      .nice()
      .range([height, 0]);

    const line = d3.line()
      .x(d => xScale(d.date) + xScale.bandwidth() / 2)
      .y(d => yScale(d.growthRate));

    svg.append('path')
      .data([data])
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', '2');

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Sales Growth Rate')
      .attr('class', 'chart-title');
  };

  const drawNewCustomersChart = (data) => {
    const svg = d3.select('#newCustomersChart');
    svg.selectAll('*').remove();

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.count))
      .attr('fill', 'orange')
      .attr('class', 'bar')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(200).attr('fill', 'red');
        svg.append('text')
          .attr('id', 'tooltip')
          .attr('x', xScale(d.date) + xScale.bandwidth() / 2)
          .attr('y', yScale(d.count) - 10)
          .attr('text-anchor', 'middle')
          .text(d.count);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('fill', 'orange');
        d3.select('#tooltip').remove();
      });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('New Customers')
      .attr('class', 'chart-title');
  };

  const drawRepeatCustomersChart = (data) => {
    const svg = d3.select('#repeatCustomersChart');
    svg.selectAll('*').remove();

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.count))
      .attr('fill', 'green')
      .attr('class', 'bar')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(200).attr('fill', 'darkgreen');
        svg.append('text')
          .attr('id', 'tooltip')
          .attr('x', xScale(d.date) + xScale.bandwidth() / 2)
          .attr('y', yScale(d.count) - 10)
          .attr('text-anchor', 'middle')
          .text(d.count);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('fill', 'green');
        d3.select('#tooltip').remove();
      });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Repeat Customers')
      .attr('class', 'chart-title');
  };

  const drawCustomerGeoChart = (data) => {
    const svg = d3.select('#customerGeoChart');
    svg.selectAll('*').remove();

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.region))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.region))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.count))
      .attr('fill', 'purple')
      .attr('class', 'bar')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(200).attr('fill', 'darkpurple');
        svg.append('text')
          .attr('id', 'tooltip')
          .attr('x', xScale(d.region) + xScale.bandwidth() / 2)
          .attr('y', yScale(d.count) - 10)
          .attr('text-anchor', 'middle')
          .text(d.count);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('fill', 'purple');
        d3.select('#tooltip').remove();
      });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Customer Geographical Distribution')
      .attr('class', 'chart-title');
  };

  const drawCustomerLifetimeValueChart = (data) => {
    const svg = d3.select('#customerLifetimeValueChart');
    svg.selectAll('*').remove();

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.customer))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.customer))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.value))
      .attr('fill', 'teal')
      .attr('class', 'bar')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(200).attr('fill', 'darkcyan');
        svg.append('text')
          .attr('id', 'tooltip')
          .attr('x', xScale(d.customer) + xScale.bandwidth() / 2)
          .attr('y', yScale(d.value) - 10)
          .attr('text-anchor', 'middle')
          .text(`$${d.value}`);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('fill', 'teal');
        d3.select('#tooltip').remove();
      });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Customer Lifetime Value')
      .attr('class', 'chart-title');
  };

  return (
    <div className="charts-container">
      <svg id="salesChart" className="chart" width="600" height="400"></svg>
      <svg id="salesGrowthRateChart" className="chart" width="600" height="400"></svg>
      <svg id="newCustomersChart" className="chart" width="600" height="400"></svg>
      <svg id="repeatCustomersChart" className="chart" width="600" height="400"></svg>
      <svg id="customerGeoChart" className="chart" width="600" height="400"></svg>
      <svg id="customerLifetimeValueChart" className="chart" width="600" height="400"></svg>
    </div>
  );
};

export default Charts;
