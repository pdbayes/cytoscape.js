let cyInstance;

document.addEventListener('DOMContentLoaded', function() {
  const cyContainer = document.getElementById('cy');
  const statusMessageDiv = document.getElementById('status-message'); // Renamed for clarity
  const loadDataBtn = document.getElementById('load-data-btn');
  const nodesFileInput = document.getElementById('nodes-file-input');
  const edgesFileInput = document.getElementById('edges-file-input');
  const loadCsvBtn = document.getElementById('load-csv-btn');

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

      if (statusMessageDiv) {
        statusMessageDiv.textContent = 'Graph initialized with sample data.';
      }
      console.log('Graph initialized with sample data.');

    } else {
      if (statusMessageDiv) {
        statusMessageDiv.textContent = 'Error: Cytoscape container element not found.';
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
      if (statusMessageDiv) {
        statusMessageDiv.textContent = 'Sample data loaded successfully.';
      }
      console.log('Sample data loaded successfully via button.');
    });
  } else {
    console.error('Error: Load Data button not found.');
    if (statusMessageDiv) {
      statusMessageDiv.textContent = 'Error: Load Data button not found.';
    }
  }

  const betweennessBtn = document.getElementById('betweenness-btn');
  if (betweennessBtn) {
    betweennessBtn.addEventListener('click', function calculateBetweenness() {
      console.log('Calculate Betweenness Centrality button clicked.');
      if (!cyInstance) {
        if (statusMessageDiv) {
          statusMessageDiv.textContent = 'Graph not initialized. Load data first.';
        }
        console.error('Graph not initialized. Load data first.');
        return;
      }

      const nodes = cyInstance.nodes();
      if (nodes.length === 0) {
        if (statusMessageDiv) {
          statusMessageDiv.textContent = 'No nodes in the graph to calculate centrality.';
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
        const minSize = 10;
        const maxSize = 50;
        const normalizedCentrality = centrality / maxCentrality;
        const newSize = minSize + (normalizedCentrality * (maxSize - minSize));
        
        node.style({
          'width': newSize + 'px',
          'height': newSize + 'px',
          'background-color': '#FFC107'
        });
        console.log(`Node ${node.id()}: Betweenness Centrality = ${centrality.toFixed(4)}, New Size = ${newSize.toFixed(2)}px`);
      });

      if (statusMessageDiv) {
        statusMessageDiv.textContent = 'Betweenness centrality calculated. Nodes resized based on centrality.';
      }
      console.log('Betweenness centrality calculation and node styling complete.');
    });
  } else {
    console.error('Error: Calculate Betweenness Centrality button not found.');
    if (statusMessageDiv) {
      statusMessageDiv.textContent = 'Error: Calculate Betweenness Centrality button not found.';
    }
  }

  const clusterBtn = document.getElementById('cluster-btn');
  if (clusterBtn) {
    clusterBtn.addEventListener('click', function identifyClusters() {
      console.log('Identify Clusters (Sample) button clicked.');
      if (!cyInstance) {
        if (statusMessageDiv) {
          statusMessageDiv.textContent = 'Graph not initialized. Load data first.';
        }
        console.error('Graph not initialized. Load data first.');
        return;
      }

      const sampleClusters = {
        'a': 1, 'b': 1, 'c': 1, 'd': 2, 'e': 2
      };
      const clusterColors = {
        1: '#69D2E7', 2: '#FA6900'
      };
      const defaultColor = '#888';

      cyInstance.nodes().forEach(node => {
        const nodeId = node.id();
        const clusterId = sampleClusters[nodeId];
        
        if (clusterId && clusterColors[clusterId]) {
          node.style('background-color', clusterColors[clusterId]);
          console.log(`Node ${nodeId} assigned to Cluster ${clusterId} with color ${clusterColors[clusterId]}.`);
        } else {
          node.style('background-color', defaultColor);
          console.log(`Node ${nodeId} not in a defined cluster or color for cluster ${clusterId} not found. Set to default color.`);
        }
      });

      if (statusMessageDiv) {
        statusMessageDiv.textContent = 'Node colors updated based on sample clusters.';
      }
      console.log('Node colors updated based on sample clusters.');
    });
  } else {
    console.error('Error: Identify Clusters (Sample) button not found.');
    if (statusMessageDiv) {
      statusMessageDiv.textContent = 'Error: Identify Clusters (Sample) button not found.';
    }
  }

  const rankBtn = document.getElementById('rank-btn');
  if (rankBtn) {
    rankBtn.addEventListener('click', function rankNodesByBetweenness() {
      console.log('Rank by Betweenness button clicked.');
      if (!cyInstance) {
        if (statusMessageDiv) {
          statusMessageDiv.textContent = 'Graph not initialized. Load data first.';
        }
        console.error('Graph not initialized. Load data first.');
        return;
      }

      const bc = cyInstance.elements().betweennessCentrality();
      if (!bc) {
        if (statusMessageDiv) {
          statusMessageDiv.textContent = 'Could not calculate betweenness centrality.';
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

      if (statusMessageDiv) {
        statusMessageDiv.innerHTML = '<strong>Nodes Ranked by Betweenness Centrality:</strong>' + rankedHtml;
      }
      
      console.log('Nodes ranked by betweenness centrality and displayed.');
    });
  } else {
    console.error('Error: Rank by Betweenness button not found.');
    if (statusMessageDiv) {
      statusMessageDiv.textContent = 'Error: Rank by Betweenness button not found.';
    }
  }

  // --- CSV Parsing Functionality ---
  function parseCSV(csvText, expectedHeaders, fileName) {
    try {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== ''); // Split lines and remove empty ones
      if (lines.length === 0) {
        throw new Error(`CSV file ${fileName} is empty or contains only whitespace.`);
      }

      const header = lines[0].split(',').map(cell => cell.trim());
      
      for (const expectedHeader of expectedHeaders) {
        if (!header.includes(expectedHeader)) {
          throw new Error(`Missing expected header '${expectedHeader}' in ${fileName}. Found headers: ${header.join(', ')}`);
        }
      }

      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',').map(cell => cell.trim());
        if (cells.length !== header.length) {
          console.warn(`Row ${i + 1} in ${fileName} has an incorrect number of columns (${cells.length} instead of ${header.length}). Skipping. Row content: ${lines[i]}`);
          continue;
        }
        const rowObject = {};
        header.forEach((colName, index) => {
          rowObject[colName] = cells[index];
        });
        data.push(rowObject);
      }
      return data;
    } catch (error) {
      console.error(`Error parsing CSV ${fileName}:`, error);
      // Re-throw the error with more context or return an error indicator
      throw new Error(`Failed to parse ${fileName}: ${error.message}`);
    }
  }

  if (loadCsvBtn && nodesFileInput && edgesFileInput) {
    loadCsvBtn.addEventListener('click', function() {
      if (statusMessageDiv) statusMessageDiv.textContent = 'Starting CSV load...';

      const nodesFile = nodesFileInput.files[0];
      const edgesFile = edgesFileInput.files[0];

      if (!nodesFile || !edgesFile) {
        if (statusMessageDiv) statusMessageDiv.textContent = 'Error: Both nodes and edges CSV files must be selected.';
        console.error('Error: Both nodes and edges CSV files must be selected.');
        return;
      }

      const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsText(file);
        });
      };

      Promise.all([readFileAsText(nodesFile), readFileAsText(edgesFile)])
        .then(([nodesCsvText, edgesCsvText]) => {
          if (statusMessageDiv) statusMessageDiv.textContent = 'Files read. Parsing CSVs...';
          
          console.log("Nodes CSV Content (first 300 chars):", nodesCsvText.substring(0, 300));
          console.log("Edges CSV Content (first 300 chars):", edgesCsvText.substring(0, 300));

          const nodesExpectedHeaders = ['ip_address'];
          const edgesExpectedHeaders = ['fm_ip', 'to_ip'];

          try {
            const parsedNodes = parseCSV(nodesCsvText, nodesExpectedHeaders, nodesFile.name);
            if (statusMessageDiv) statusMessageDiv.textContent = 'Nodes CSV parsed.';
            console.log("Parsed Nodes:", parsedNodes);

            const parsedEdges = parseCSV(edgesCsvText, edgesExpectedHeaders, edgesFile.name);
            if (statusMessageDiv) statusMessageDiv.textContent = 'Edges CSV parsed. Data ready for graph.';
            console.log("Parsed Edges:", parsedEdges);

            // 2. Transform Data for Cytoscape
            const cyNodes = parsedNodes.map(node => ({
              data: { id: node.ip_address }
              // Add other node attributes here if they exist in the CSV and are needed
            }));

            const cyEdges = parsedEdges.map(edge => ({
              data: {
                id: `e_${edge.fm_ip}_${edge.to_ip}_${Math.random().toString(16).slice(2,8)}`, // Generate a unique edge ID
                source: edge.fm_ip,
                target: edge.to_ip
                // Add other edge attributes here (e.g., weight) if they exist
              }
            }));

            // 3. Node ID Consistency Check (Basic)
            const nodeIds = new Set(cyNodes.map(node => node.data.id));
            let validEdges = [];
            let missingNodeWarnings = [];

            cyEdges.forEach(edge => {
              let edgeIsValid = true;
              if (!nodeIds.has(edge.data.source)) {
                missingNodeWarnings.push(`Edge source '${edge.data.source}' (for target '${edge.data.target}') not found in nodes list.`);
                edgeIsValid = false;
              }
              if (!nodeIds.has(edge.data.target)) {
                missingNodeWarnings.push(`Edge target '${edge.data.target}' (from source '${edge.data.source}') not found in nodes list.`);
                edgeIsValid = false;
              }
              if (edgeIsValid) {
                validEdges.push(edge);
              }
            });

            if (missingNodeWarnings.length > 0) {
              console.warn("CSV Data Warnings:\n" + missingNodeWarnings.join("\n"));
              if (statusMessageDiv) {
                // Append warning to current message or set a new one
                const currentMessage = statusMessageDiv.textContent;
                statusMessageDiv.textContent = currentMessage + " Warning: Some edges refer to missing node IPs. Check console for details. These edges were ignored.";
              }
            }

            // 4. Update Cytoscape Instance
            initializeCytoscape(cyNodes, validEdges); // Use validEdges

            // initializeCytoscape already runs a layout.

            // 5. Final User Feedback
            // If there were warnings, the message is already set. Otherwise, set success.
            if (missingNodeWarnings.length === 0 && statusMessageDiv) {
              statusMessageDiv.textContent = 'Graph updated successfully from CSV data!';
            } else if (statusMessageDiv) {
              // Append a success message if warnings were also shown
               statusMessageDiv.textContent += ' Graph updated (with warnings).';
            }
            console.log('Graph updated from CSV data.');


          } catch (error) {
            console.error("CSV Processing or Graph Update Error:", error); // Changed error log message
            if (statusMessageDiv) statusMessageDiv.textContent = `Error processing CSV data: ${error.message}`;
          }
        })
        .catch(error => {
          console.error("File Reading Error:", error);
          if (statusMessageDiv) statusMessageDiv.textContent = 'Error reading files.';
        });
    });
  } else {
    if (!loadCsvBtn) console.error('Error: Load CSV button not found.');
    if (!nodesFileInput) console.error('Error: Nodes file input not found.');
    if (!edgesFileInput) console.error('Error: Edges file input not found.');
    if (statusMessageDiv) statusMessageDiv.textContent = 'Error: CSV input elements not found on page.';
  }
});
