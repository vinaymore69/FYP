function updateDashboradContent(value){
    
    if(value=="dashboard"){
        document.getElementById("dashboard-content-button1").style.display="block";
        document.getElementById("dashboard-content-button2").style.display="none";
        document.getElementById("dashboard-content-button3").style.display="none";
        document.getElementById("dashboard-content-button4").style.display="none";
    }else if(value=="profile"){
        document.getElementById("dashboard-content-button2").style.display="block";
        document.getElementById("dashboard-content-button1").style.display="none";
        document.getElementById("dashboard-content-button3").style.display="none";
        document.getElementById("dashboard-content-button4").style.display="none";

    }else if(value=="notes"){
        document.getElementById("dashboard-content-button3").style.display="block";
        document.getElementById("dashboard-content-button1").style.display="none";
        document.getElementById("dashboard-content-button2").style.display="none";
        document.getElementById("dashboard-content-button4").style.display="none";

    }else if(value=="videos"){
        document.getElementById("dashboard-content-button4").style.display="block";
        document.getElementById("dashboard-content-button1").style.display="none";
        document.getElementById("dashboard-content-button2").style.display="none";
        document.getElementById("dashboard-content-button3").style.display="none";
    }

}