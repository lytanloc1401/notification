function validateForm() {
    var email = document.forms["myForm"]["username"].value;
    var pass = document.forms["myForm"]["password"].value;
    if (email.indexOf("@student.tdtu.edu.vn") == -1) {

        prompt("Vui Lòng Đăng Nhập Bằng Email Sinh Viên:", "____@student.tdtu.edu.vn");

        return false;
    } else if (pass.length < 8) {
        prompt("Vui Lòng Nhập Mật Khẩu", "********");
        return false;
    }
}

function CustomAlert() {
    this.render = function(dialog) {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogoverlay = document.getElementById('dialogoverlay');
        var dialogbox = document.getElementById('dialogbox');
        dialogoverlay.style.display = "block";
        dialogoverlay.style.height = winH + "px";
        dialogbox.style.left = (winW / 2) - (550 * .5) + "px";
        dialogbox.style.top = "100px";
        dialogbox.style.display = "block";
        document.getElementById('dialogboxhead').innerHTML = "Acknowledge This Message";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="Alert.ok()">OK</button>';
    }
    this.ok = function() {
        document.getElementById('dialogbox').style.display = "none";
        document.getElementById('dialogoverlay').style.display = "none";
    }
}
var Alert = new CustomAlert();