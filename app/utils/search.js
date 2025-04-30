// lib/search.js
import FlexSearch from "flexsearch";

// Create a new index instance
let index = new FlexSearch.Document({
  tokenize: "forward",
  cache: 100,
  document: {
    id: "id",
    index: ["name", "parentName", "countryName", "completeName", "fullName"],
    store: true
  }
});

export function addDocuments(docs) {
  // Reset the index before adding new documents
  index = new FlexSearch.Document({
    tokenize: "forward",
    cache: 100,
    document: {
      id: "id",
      index: ["name", "parentName", "countryName", "completeName", "fullName"],
      store: ["id", "name", "parentName", "countryName", "completeName", "fullName"]
    }
  });
  
  // Add each document to the index
  if (Array.isArray(docs)) {
    docs.forEach(doc => {
      index.add(doc);
    });
  }
}

export function search(query) {
  if (!query || query.length < 2) return [];
  
  // Search in all indexed fields
  const nameResults = index.search(query, { index: "name", limit: 30, enrich: true });
  const parentResults = index.search(query, { index: "parentName", limit: 10, enrich: true });
  const countryResults = index.search(query, { index: "countryName", limit: 10, enrich: true });
  const completeNameResults = index.search(query, { index: "completeName", limit: 10, enrich: true });
  const fullNameResults = index.search(query, { index: "fullName", limit: 10, enrich: true });


  // Combine all results and remove duplicates based on id
  const allResults = [
    ...nameResults,
    ...parentResults, 
    ...countryResults,
    ...completeNameResults,
    ...fullNameResults
  ];
  
  // Extract documents from results
  const flatResults = allResults.flatMap(resultSet => resultSet.result || []);
  
  // Remove duplicates (same document showing up in multiple search fields)
  const uniqueResults = [...new Map(flatResults.map(item => [item.id, item.doc])).values()];
  
  return uniqueResults;
}
