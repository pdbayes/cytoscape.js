let cyInstance;

document.addEventListener('DOMContentLoaded', function() {
  const cyContainer = document.getElementById('cy');
  const statusMessage = document.getElementById('status-message');
  const loadDataBtn = document.getElementById('load-data-btn');

  const sampleNodes = [
    { data: { id: 'a' } },
    { data: { id: 'b' } },
    { data: { id: 'c' } },
    { data: { id: 'd' } },
    { data: { id: 'e' } }
  ];

  const sampleEdges = [
    { data: { id: 'ab', source: 'a', target: 'b' } },
    { data: { id: 'bc', source: 'b', target: 'c' } },
    { data: { id: 'ca', source: 'c', target: 'a' } },
    { data: { id: 'ad', source: 'a', target: 'd' } },
    { data: { id: 'de', source: 'd', target: 'e' } }
  ];

  function initializeCytoscape(nodes, edges) {
    if (cyInstance) {
      cyInstance.destroy();
    }

    if (cyContainer) {
      cyInstance = cytoscape({
        container: cyContainer,
        elements: {
          nodes: nodes,
          edges: edges
        },
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              'label': 'data(id)',
              'color': '#fff', // Label text color
              'text-outline-width': 1,
              'text-outline-color': '#000' // Black outline for better visibility
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle'
            }
          }
        ],
        layout: {
          name: 'cose'
        }
      });

      if (statusMessage) {
        statusMessage.textContent = 'Graph initialized with sample data.';
      }
      console.log('Graph initialized with sample data.');

    } else {
      if (statusMessage) {
        statusMessage.textContent = 'Error: Cytoscape container element not found.';
      }
      console.error('Error: Cytoscape container element not found.');
    }
  }

  // Initial load
  initializeCytoscape(sampleNodes, sampleEdges);

  if (loadDataBtn) {
    loadDataBtn.addEventListener('click', function() {
      console.log('Load Sample Data button clicked.');
      initializeCytoscape(sampleNodes, sampleEdges);
      // Reset node styles that might have been applied by other functions
      if (cyInstance) {
        cyInstance.nodes().forEach(node => {
          node.style({
            'width': '', // Reset to default from stylesheet
            'height': '', // Reset to default from stylesheet
            'background-color': '#666' // Reset to initial color
          });
        });
         // Re-apply layout for a fresh look
        cyInstance.layout({ name: 'cose' }).run();
      }
      if (statusMessage) {
        statusMessage.textContent = 'Sample data loaded successfully.';
      }
      console.log('Sample data loaded successfully via button.');
    });
  } else {
    console.error('Error: Load Data button not found.');
    if (statusMessage) {
      statusMessage.textContent = 'Error: Load Data button not found.';
    }
  }

  const betweennessBtn = document.getElementById('betweenness-btn');
  if (betweennessBtn) {
    betweennessBtn.addEventListener('click', function calculateBetweenness() {
      console.log('Calculate Betweenness Centrality button clicked.');
      if (!cyInstance) {
        if (statusMessage) {
          statusMessage.textContent = 'Graph not initialized. Load data first.';
        }
        console.error('Graph not initialized. Load data first.');
        return;
      }

      const nodes = cyInstance.nodes();
      if (nodes.length === 0) {
        if (statusMessage) {
          statusMessage.textContent = 'No nodes in the graph to calculate centrality.';
        }
        console.warn('No nodes in the graph to calculate centrality.');
        return;
      }

      const bc = cyInstance.elements().betweennessCentrality(); // Calculate for all elements

      let maxCentrality = 0;
      nodes.forEach(node => {
        const centrality = bc.value(node); // Get centrality for the current node
        if (centrality > maxCentrality) {
          maxCentrality = centrality;
        }
      });
      
      // Avoid division by zero if all centralities are 0
      if (maxCentrality === 0) maxCentrality = 1;


      nodes.forEach(node => {
        const centrality = bc.value(node);
        // Normalize centrality for styling: scale from 0 to 1, then multiply for size
        // We'll scale it such that the maxCentrality node gets a size of, say, 50px, and min gets 10px.
        // Scaled size = minSize + (normalizedCentrality * (maxSize - minSize))
        // Normalized centrality = centrality / maxCentrality
        const minSize = 10;
        const maxSize = 50;
        const normalizedCentrality = centrality / maxCentrality;
        const newSize = minSize + (normalizedCentrality * (maxSize - minSize));
        
        node.style({
          'width': newSize + 'px',
          'height': newSize + 'px',
          'background-color': '#FFC107' // Change color to indicate calculation
          // Transition is now handled by CSS
        });
        console.log(`Node ${node.id()}: Betweenness Centrality = ${centrality.toFixed(4)}, New Size = ${newSize.toFixed(2)}px`);
      });

      if (statusMessage) {
        statusMessage.textContent = 'Betweenness centrality calculated. Nodes resized based on centrality.';
      }
      console.log('Betweenness centrality calculation and node styling complete.');
    });
  } else {
    console.error('Error: Calculate Betweenness Centrality button not found.');
    if (statusMessage) {
      statusMessage.textContent = 'Error: Calculate Betweenness Centrality button not found.';
    }
  }

  const clusterBtn = document.getElementById('cluster-btn');
  if (clusterBtn) {
    clusterBtn.addEventListener('click', function identifyClusters() {
      console.log('Identify Clusters (Sample) button clicked.');
      if (!cyInstance) {
        if (statusMessage) {
          statusMessage.textContent = 'Graph not initialized. Load data first.';
        }
        console.error('Graph not initialized. Load data first.');
        return;
      }

      const sampleClusters = {
        'a': 1,
        'b': 1,
        'c': 1,
        'd': 2,
        'e': 2
      };
      const clusterColors = {
        1: '#69D2E7', // Blueish
        2: '#FA6900'  // Orangeish
      };
      const defaultColor = '#888'; // Default color for unclustered nodes or if clusterId is missing

      cyInstance.nodes().forEach(node => {
        const nodeId = node.id();
        const clusterId = sampleClusters[nodeId];
        
        if (clusterId && clusterColors[clusterId]) {
          node.style('background-color', clusterColors[clusterId]);
          console.log(`Node ${nodeId} assigned to Cluster ${clusterId} with color ${clusterColors[clusterId]}.`);
        } else {
          node.style('background-color', defaultColor); // Optional: color nodes not in a defined cluster
          console.log(`Node ${nodeId} not in a defined cluster or color for cluster ${clusterId} not found. Set to default color.`);
        }
      });

      if (statusMessage) {
        statusMessage.textContent = 'Node colors updated based on sample clusters.';
      }
      console.log('Node colors updated based on sample clusters.');
    });
  } else {
    console.error('Error: Identify Clusters (Sample) button not found.');
    if (statusMessage) {
      statusMessage.textContent = 'Error: Identify Clusters (Sample) button not found.';
    }
  }

  const rankBtn = document.getElementById('rank-btn');
  if (rankBtn) {
    rankBtn.addEventListener('click', function rankNodesByBetweenness() {
      console.log('Rank by Betweenness button clicked.');
      if (!cyInstance) {
        if (statusMessage) {
          statusMessage.textContent = 'Graph not initialized. Load data first.';
        }
        console.error('Graph not initialized. Load data first.');
        return;
      }

      const bc = cyInstance.elements().betweennessCentrality();
      if (!bc) {
        if (statusMessage) {
          statusMessage.textContent = 'Could not calculate betweenness centrality.';
        }
        console.error('Could not calculate betweenness centrality.');
        return;
      }

      const nodeScores = [];
      cyInstance.nodes().forEach(node => {
        const score = bc.value(node);
        nodeScores.push({ id: node.id(), score: score });
      });

      nodeScores.sort((a, b) => b.score - a.score);

      let rankedHtml = '<ol>';
      nodeScores.forEach((item, index) => {
        rankedHtml += `<li>Rank ${index + 1}: Node ${item.id} (Score: ${item.score.toFixed(4)})</li>`;
        console.log(`Rank ${index + 1}: Node ${item.id} (Score: ${item.score.toFixed(4)})`);
      });
      rankedHtml += '</ol>';

      if (statusMessage) {
        statusMessage.innerHTML = '<strong>Nodes Ranked by Betweenness Centrality:</strong>' + rankedHtml;
      }
      
      console.log('Nodes ranked by betweenness centrality and displayed.');
    });
  } else {
    console.error('Error: Rank by Betweenness button not found.');
    if (statusMessage) {
      statusMessage.textContent = 'Error: Rank by Betweenness button not found.';
    }
  }
});
