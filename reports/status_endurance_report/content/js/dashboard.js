/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 52.81797703422889, "KoPercent": 47.18202296577111};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5269188506126037, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7025295591402576, 500, 1500, "Status code 404"], "isController": false}, {"data": [0.7025405476682344, 500, 1500, "Status code 500"], "isController": false}, {"data": [0.0, 500, 1500, "Status code 301"], "isController": false}, {"data": [0.7026130145265147, 500, 1500, "Status code 200"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 182010, 85876, 47.18202296577111, 195.91180154936373, 0, 898309, 129.0, 220.0, 315.0, 756.0, 101.11632961223462, 238.04538164560284, 7.563779583408333], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Status code 404", 45502, 13457, 29.574524196738604, 196.0243505779962, 0, 898307, 128.0, 145.0, 166.0, 380.0, 25.28619378931691, 68.91744963301899, 2.5220230722903283], "isController": false}, {"data": ["Status code 500", 45502, 13458, 29.576721902333965, 195.9443760713822, 0, 898306, 128.0, 144.0, 167.0, 371.9900000000016, 25.29322171452712, 69.14486894135844, 2.5226453193267853], "isController": false}, {"data": ["Status code 301", 45503, 45503, 100.0, 195.914928686021, 0, 898309, 128.0, 144.0, 167.0, 373.0, 25.280034311911724, 31.266509716823947, 0.0], "isController": false}, {"data": ["Status code 200", 45503, 13458, 29.57607190734677, 195.7635540513822, 0, 898308, 128.0, 145.0, 166.0, 370.0, 25.279374223960488, 68.77697692159188, 2.521287484270877], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 898,218 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.001164469700498393, 5.494203615185978E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (the-internet.herokuapp.com)", 1, 0.001164469700498393, 5.494203615185978E-4], "isController": false}, {"data": ["The operation lasted too long: It took 898,304 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.001164469700498393, 5.494203615185978E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 1, 0.001164469700498393, 5.494203615185978E-4], "isController": false}, {"data": ["500/Internal Server Error", 5, 0.005822348502491965, 0.0027471018075929895], "isController": false}, {"data": ["The operation lasted too long: It took 898,308 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.001164469700498393, 5.494203615185978E-4], "isController": false}, {"data": ["The operation lasted too long: It took 898,230 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.001164469700498393, 5.494203615185978E-4], "isController": false}, {"data": ["404/Not Found", 5, 0.005822348502491965, 0.0027471018075929895], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: the-internet.herokuapp.com", 53808, 62.65778564441753, 29.563210812592715], "isController": false}, {"data": ["Non HTTP response code: java.lang.IllegalArgumentException/Non HTTP response message: Missing location header in redirect for GET https://the-internet.herokuapp.com/status_codes/301 HTTP/1.1", 32051, 37.322418370673994, 17.60947200703258], "isController": false}, {"data": ["The operation lasted too long: It took 898,206 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.001164469700498393, 5.494203615185978E-4], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 182010, 85876, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: the-internet.herokuapp.com", 53808, "Non HTTP response code: java.lang.IllegalArgumentException/Non HTTP response message: Missing location header in redirect for GET https://the-internet.herokuapp.com/status_codes/301 HTTP/1.1", 32051, "500/Internal Server Error", 5, "404/Not Found", 5, "The operation lasted too long: It took 898,218 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Status code 404", 45502, 13457, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: the-internet.herokuapp.com", 13452, "404/Not Found", 5, "", "", "", "", "", ""], "isController": false}, {"data": ["Status code 500", 45502, 13458, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: the-internet.herokuapp.com", 13453, "500/Internal Server Error", 5, "", "", "", "", "", ""], "isController": false}, {"data": ["Status code 301", 45503, 45503, "Non HTTP response code: java.lang.IllegalArgumentException/Non HTTP response message: Missing location header in redirect for GET https://the-internet.herokuapp.com/status_codes/301 HTTP/1.1", 32051, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: the-internet.herokuapp.com", 13451, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (the-internet.herokuapp.com)", 1, "", "", "", ""], "isController": false}, {"data": ["Status code 200", 45503, 13458, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: the-internet.herokuapp.com", 13452, "The operation lasted too long: It took 898,218 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 898,304 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 1, "The operation lasted too long: It took 898,308 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
