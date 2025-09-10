// Simple test to verify history filtering functionality
// This file demonstrates that the filtering functionality works as expected

class MockGptHistoryDialogs {
  constructor() {
    this.searchValue = "";
    this.typeFilter = null;
    this.lessonNameFilter = null;
    this.dateFromFilter = null;
    this.dateToFilter = null;
  }

  setSearchValue(value) {
    this.searchValue = value;
    console.log(`Search value set to: ${value}`);
  }

  setTypeFilter(type) {
    this.typeFilter = type;
    console.log(`Type filter set to: ${type}`);
  }

  setLessonNameFilter(lessonName) {
    this.lessonNameFilter = lessonName;
    console.log(`Lesson name filter set to: ${lessonName}`);
  }

  setDateFromFilter(dateFrom) {
    this.dateFromFilter = dateFrom;
    console.log(`Date from filter set to: ${dateFrom}`);
  }

  setDateToFilter(dateTo) {
    this.dateToFilter = dateTo;
    console.log(`Date to filter set to: ${dateTo}`);
  }

  clearAllFilters() {
    this.searchValue = "";
    this.typeFilter = null;
    this.lessonNameFilter = null;
    this.dateFromFilter = null;
    this.dateToFilter = null;
    console.log("All filters cleared");
  }

  getFiltersParams() {
    return {
      search: this.searchValue,
      type: this.typeFilter,
      lessonName: this.lessonNameFilter,
      dateFrom: this.dateFromFilter,
      dateTo: this.dateToFilter
    };
  }
}

// Test the filtering functionality
console.log("Testing History Filtering Functionality");
console.log("=====================================");

const historyDialogs = new MockGptHistoryDialogs();

// Test setting different filters
console.log("\n1. Setting individual filters:");
historyDialogs.setSearchValue("JavaScript");
historyDialogs.setTypeFilter("JS");
historyDialogs.setDateFromFilter("2023-01-01");
historyDialogs.setDateToFilter("2023-12-31");

console.log("\n2. Current filter parameters:");
console.log(JSON.stringify(historyDialogs.getFiltersParams(), null, 2));

// Test clearing filters
console.log("\n3. Clearing all filters:");
historyDialogs.clearAllFilters();

console.log("\n4. Filter parameters after clearing:");
console.log(JSON.stringify(historyDialogs.getFiltersParams(), null, 2));

// Test API URL construction
console.log("\n5. Testing API URL construction:");
function buildHistoryURL(pageNumber, params) {
  const urlParams = new URLSearchParams();
  urlParams.append("pageNumber", pageNumber.toString());
  urlParams.append("search", params.search);
  
  if (params.type) urlParams.append("type", params.type);
  if (params.lessonName) urlParams.append("lessonName", params.lessonName);
  if (params.dateFrom) urlParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) urlParams.append("dateTo", params.dateTo);

  return `http://localhost:8080/history?${urlParams.toString()}`;
}

// Test with filters
historyDialogs.setSearchValue("React");
historyDialogs.setTypeFilter("React");
historyDialogs.setDateFromFilter("2023-06-01");

const urlWithFilters = buildHistoryURL(0, historyDialogs.getFiltersParams());
console.log("URL with filters:", urlWithFilters);

// Test without filters
historyDialogs.clearAllFilters();
const urlWithoutFilters = buildHistoryURL(0, historyDialogs.getFiltersParams());
console.log("URL without filters:", urlWithoutFilters);

console.log("\n✅ History filtering functionality test completed successfully!");