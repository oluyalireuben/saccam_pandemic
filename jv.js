// Created by Reuben #Infinity Love

const newData = new Map();
var countriesData    = null;

console.log = function() {}

window.onload = function(){
    $(".loader").css("display", "block");
    $("#card1").css("display", "none");
    $(".chartContainer4").css("display", "none");

    httpGet('https://api.covid19api.com/summary');
}

function httpGet(link) {
    if(link !== null && link !== undefined && link !== "") {
        $.ajax({
            url: link,
            success: function(data) {
                //console.log(data)]

                addCountriesToList(data);
                getReport();

                const d1 = new Date(data.Date);

                $('.collapsible').html('<b id = "label">Cases Global</b> <br>Today Till<br> (' + d1.toString() + ")");
                $("#card1").css("display", "block");
                $(".tabcontent").css("display", "block");
                $(".loader").css("display", "none");
            },
            error: function() {
                alert("System seems to be offline, try again!");
            }
        });
    }
}

function addCountriesToList(data){
    countriesData   = data.Countries;
    var countryList     = document.getElementById('countryList');

    var globalReport    =  data.Global;

    var globalData  = {};

    globalData.NewConfirmed     = globalReport.NewConfirmed;
    globalData.TotalConfirmed   = globalReport.TotalConfirmed;
    globalData.NewDeaths        = globalReport.NewDeaths;
    globalData.TotalDeaths      = globalReport.TotalDeaths;
    globalData.NewRecovered     = globalReport.NewRecovered;
    globalData.TotalRecovered   = globalReport.TotalRecovered;
    globalData.Date             = new Date();
    newData.set('global', globalData);

    for(var i = 0; i < countriesData.length; i++) {
        var opt         = document.createElement('option');
        opt.value       = countriesData[i].Slug;
        opt.innerHTML   = countriesData[i].Country + " (" + countriesData[i].CountryCode + ")";
        countryList.appendChild(opt);

        var object  = {};

        object.NewConfirmed     = countriesData[i].NewConfirmed;
        object.TotalConfirmed   = countriesData[i].TotalConfirmed;
        object.NewDeaths        = countriesData[i].NewDeaths;
        object.TotalDeaths      = countriesData[i].TotalDeaths;
        object.NewRecovered     = countriesData[i].NewRecovered;
        object.TotalRecovered   = countriesData[i].TotalRecovered;
        object.Date             = countriesData[i].Date;
        newData.set(countriesData[i].Slug, object);
    }
}

function getReport() {
    var report          = $('#countryList').val();
    var globalReport    = newData.get(report);

    var totalActive = globalReport.TotalConfirmed - globalReport.TotalRecovered - globalReport.TotalDeaths;
    var newActive = globalReport.NewConfirmed - globalReport.NewRecovered - globalReport.NewDeaths;

    $('#totalConfirmed').html('<b class="count">' + (globalReport.TotalConfirmed) + '</b><br><br>Confirmed');
    $('#newConfirmed').html('<b class="count">' + (globalReport.NewConfirmed) + '</b><br><br>New Confirmed');
    $('#totalRecovered').html('<b class="count">' + (globalReport.TotalRecovered) + '</b><br><br>Recovered');
    $('#newRecovered').html('<b class="count">' + (globalReport.NewRecovered) + '</b><br><br>New Recovered');
    $('#totalDeath').html('<b class="count">' + (globalReport.TotalDeaths) + '</b><br><br>Deaths');
    $('#newDeath').html('<b class="count">' + (globalReport.NewDeaths) + '</b><br><br>New Deaths');
    $('#totalActive').html('<b class="count">' + (totalActive) + '</b><br><br>Active Cases (Confirmed - Recovered - Deaths)');
    $('#newActive').html('<b class="count">' + (newActive) + '</b><br><br>New Active Cases (Confirmed - Recovered - Deaths)');

    counterWithCommasNumber();

    if(totalActive === 0) {
        $(".chartContainer2").css("display", "none");
        $(".chartContainer3").css("display", "none");
        $(".chartContainer4").css("display", "none");
        $(".content1").css("display", "none");
        $(".nocase").css("display", "block");
        $("#label").html("Cases in " + $('#countryList option:selected').text());
        return;
    } else {
        $(".chartContainer2").css("display", "block");
        $(".chartContainer3").css("display", "block");
        $(".content1").css("display", "block");
        $(".nocase").css("display", "none");
    }

    showGraph('subjectwise', '', globalReport.TotalConfirmed, globalReport.TotalRecovered, globalReport.TotalDeaths);

    if(report != 'global') {
        getDataByCountry(report);
        $(".chartContainer4").css("display", "block");
        $("#label").html("Cases in " + $('#countryList option:selected').text());
    } else {
        $(".chartContainer4").css("display", "none");
        $("#label").html("Cases Global");
    }
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getTopTenCountriesByDeath() {
    countriesData.sort(function(a, b) {
        return b.TotalDeaths - a.TotalDeaths
    });

    var totalXP = [];

    for(var j = 0; j < 10; j++) {
        var obj1  = countriesData[j];

        totalXP.push({
            label : obj1.Country, y : obj1.TotalDeaths
        });
    }

    var options = {
        theme: "dark2",
        width: 450,
        height:260,
        animationEnabled: true,
        legend: {
            maxWidth: 350,
            itemWidth: 120
        },

        data: [{
            type: "doughnut",
            innerRadius: "40%",
            toolTipContent: "<b>{label}</b>: {y} (#percent%)",
            indexLabelFontSize: 12,
            showInLegend: "true",
            legendText: "{label}",
            indexLabel: "{label} (#percent%)",
            //yValueFormatString: "#,##0,,.## Million",
            dataPoints: totalXP
        }]
    };

    var options1 = {
        theme: "dark2",
        width: 450,
        height:260,
        animationEnabled: true,
        legend: {
            maxWidth: 350,
            itemWidth: 120
        },

        data: [{
            type: "column",
            indexLabelFontSize: 12,
            //yValueFormatString: "#,##0,,.## Million",
            dataPoints: totalXP
        }]
    };

    $("#chartContainer").CanvasJSChart(options);
    $("#chartContainer1").CanvasJSChart(options1);
    $(".modal-title").html("Top Ten Countries By Death");
    $("#myModal").modal('show');
}

function getTopTenCountriesByTotal() {
    countriesData.sort(function(a, b) {
        return b.TotalConfirmed - a.TotalConfirmed
    });

    var totalXP = [];

    for(var j = 0; j < 10; j++) {
        var obj1  = countriesData[j];

        totalXP.push({
            label : obj1.Country, y : obj1.TotalConfirmed
        });
    }

    var options = {
        theme: "dark2",
        width: 450,
        height:260,
        animationEnabled: true,
        legend: {
            maxWidth: 350,
            itemWidth: 120
        },

        data: [{
            type: "doughnut",
            innerRadius: "40%",
            toolTipContent: "<b>{label}</b>: {y} (#percent%)",
            indexLabelFontSize: 12,
            showInLegend: "true",
            legendText: "{label}",
            indexLabel: "{label} (#percent%)",
            //yValueFormatString: "#,##0,,.## Million",
            dataPoints: totalXP
        }]
    };

    var options1 = {
        theme: "dark2",
        width: 450,
        height:260,
        animationEnabled: true,
        legend: {
            maxWidth: 350,
            itemWidth: 120
        },

        data: [{
            type: "column",
            indexLabelFontSize: 12,
            //yValueFormatString: "#,##0,,.## Million",
            dataPoints: totalXP
        }]
    };

    $("#chartContainer").CanvasJSChart(options);
    $("#chartContainer1").CanvasJSChart(options1);
    $(".modal-title").html("Top Ten Countries By Total Cases");
    $("#myModal").modal('show');
}

function getTopTenCountriesByActive() {
    countriesData.sort(function(a, b) {
        return (b.TotalConfirmed - b.TotalRecovered - b.TotalDeaths) - (a.TotalConfirmed - a.TotalRecovered - a.TotalDeaths)
    });

    var totalXP = [];

    for(var j = 0; j < 10; j++) {
        var obj1  = countriesData[j];

        totalXP.push({
            label : obj1.Country, y : (obj1.TotalConfirmed - obj1.TotalRecovered - obj1.TotalDeaths)
        });
    }

    var options = {
        theme: "dark2",
        width: 450,
        height:260,
        animationEnabled: true,
        legend: {
            maxWidth: 350,
            itemWidth: 120
        },

        data: [{
            type: "doughnut",
            innerRadius: "40%",
            toolTipContent: "<b>{label}</b>: {y} (#percent%)",
            indexLabelFontSize: 12,
            showInLegend: "true",
            legendText: "{label}",
            indexLabel: "{label} (#percent%)",
            //yValueFormatString: "#,##0,,.## Million",
            dataPoints: totalXP
        }]
    };

    var options1 = {
        theme: "dark2",
        width: 450,
        height:260,
        animationEnabled: true,
        legend: {
            maxWidth: 350,
            itemWidth: 120
        },

        data: [{
            type: "column",
            indexLabelFontSize: 12,
            //yValueFormatString: "#,##0,,.## Million",
            dataPoints: totalXP
        }]
    };

    $("#chartContainer").CanvasJSChart(options);
    $("#chartContainer1").CanvasJSChart(options1);
    $(".modal-title").html("Top Ten Countries By Active Cases");
    $("#myModal").modal('show');
}

function someInfo() {
    $(".modal-title").html("Some prevention on Corona Virus");
    $("#myModal1").modal('show');
}

function showGraph(id, cnt, confirmed, recovered, deaths) {

    if(id) {

        var active = confirmed - recovered - deaths;
        var totalXP = [];

        totalXP.push({label : 'Confirmed', y : confirmed});
        totalXP.push({label : 'Recovered', y : recovered});
        totalXP.push({label : 'Deaths', y : deaths});
        totalXP.push({label : 'Active', y : active});

        var options = {
            //theme: "dark2",
            width: 400,
            height:260,
            animationEnabled: true,
            legend: {
                maxWidth: 350,
                itemWidth: 120
            },

            data: [{
                type: "doughnut",
                innerRadius: "40%",
                toolTipContent: "<b>{label}</b>: {y} (#percent%)",
                indexLabelFontSize: 12,
                showInLegend: "true",
                legendText: "{label}",
                indexLabel: "{label} (#percent%)",
                //yValueFormatString: "#,##0,,.## Million",
                dataPoints: totalXP
            }]
        };

        var options1 = {
            //theme: "dark2",
            width: 400,
            height:260,
            animationEnabled: true,
            legend: {
                maxWidth: 350
            },

            data: [{
                type: "column",
                //yValueFormatString: "#,##0,,.## Million",
                dataPoints: totalXP
            }]
        };


        $("#chartContainer2").CanvasJSChart(options);
        $("#chartContainer3").CanvasJSChart(options1);
    }
}

function getDataByCountry(country) {
    $.ajax({
        url: "https://api.covid19api.com/live/country/" + country,
        success: function(data) {
            //console.log(data)]
            getDailyData(data);
        },
        error: function() {
            alert("System seems to be offline, try again!");
        }
    });
}

function getDailyData(data) {
    var totalConfirmed  = [];
    var totalDeaths     = [];
    var totalRecovered  = [];
    var totalActive     = [];

    for(var i = 0; i < data.length; i++) {
        totalConfirmed.push({
            x : new Date(data[i].Date),
            y : data[i].Confirmed
        });

        totalDeaths.push({
            x : new Date(data[i].Date),
            y : data[i].Deaths
        });

        totalRecovered.push({
            x : new Date(data[i].Date),
            y : data[i].Recovered
        });

        totalActive.push({
            x : new Date(data[i].Date),
            y : data[i].Active
        });
    }


    var options = {
        animationEnabled: true,
        zoomEnabled: true,
        theme: "light2",
        height:260,
        title:{
            text: "Daily Report",
            fontSize: 14
        },
        axisX:{
            valueFormatString: "DD MMM",
            crosshair: {
                enabled: true,
                snapToDataPoint: true
            }
        },
        axisY: {
            title: "Cases",
            crosshair: {
                enabled: true
            }
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor:"pointer",
            verticalAlign: "bottom",
            itemclick: toggleDataSeries
        },
        data: [{
            type: "line",
            name: "Confirmed",
            color: "#369EAD",
            showInLegend: true,
            markerType: "square",
            xValueFormatString: "DD MMM, YYYY",
            yValueFormatString: "0",
            dataPoints: totalConfirmed
        },
            {
                type: "line",
                name: "Deaths",
                color: "#C24642",
                showInLegend: true,
                lineDashType: "dash",
                xValueFormatString: "DD MMM, YYYY",
                yValueFormatString: "0",
                dataPoints: totalDeaths
            },
            {
                type: "line",
                name: "Recovered",
                color: "green",
                showInLegend: true,
                lineDashType: "dash",
                markerType: "square",
                xValueFormatString: "DD MMM, YYYY",
                yValueFormatString: "0",
                dataPoints: totalRecovered
            },
            {
                type: "line",
                name: "Active",
                color: "#7F6084",
                lineDashType: "dash",
                showInLegend: true,
                xValueFormatString: "DD MMM, YYYY",
                yValueFormatString: "0",
                dataPoints: totalActive
            }]
    };

    $("#chartContainer4").CanvasJSChart(options);
}

function toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    } else {
        e.dataSeries.visible = true;
    }
    e.chart.render();
}

function someInfo() {
    $(".modal-title").html("Some prevention on Corona Virus");
    $("#myModal1").modal('show');
}

function getZDate(date) {
    const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let current_datetime = new Date(date);

    let formatted_date = current_datetime.getDate() + " " + months[current_datetime.getMonth()] + ", " + current_datetime.getFullYear() + " " + formatAMPM(current_datetime);

    return formatted_date;

}

function formatAMPM(date) {
    var hours     = date.getHours();
    var minutes   = date.getMinutes();
    var seconds   = date.getSeconds();
    var ampm      = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function counterWithCommasNumber() {
    $('.count').each(function () {
        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        }, {
            duration: 1000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now).toLocaleString('en'));
            }
        });
    });
}