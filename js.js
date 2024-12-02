document.getElementById("get-link").addEventListener("click", function() {
    var code = document.getElementById("chya").value;
    var errorMessage = document.getElementById("P-For-Errors");

    switch (code) {
        
        case "1":
            window.location.href = "https://is.gd/IVBOxZ";
            break;
        case "2":
            window.location.href = "https://is.gd/ZJfY6R";
            break;
        case "3":
            window.location.href = "https://drive.google.com/drive/folders/1-8EYKCbzZunynH8G-IqkNwfzwiLGk5wH";
            break;
        case "4":
            window.location.href = "https://drive.google.com/drive/folders/1-F4kAPUOi3O84m-gEWYAyEpFitMB9xHT";
            break 
            case "5":
            window.location.href = "https://t.me/LightroomCc_bot";
            break 
            case "6":
            window.location.href = "https://emojicombos.com/aesthetic";
            break 
            case "7":
            window.location.href = "https://sulltan.me/codes/7/";
            break 
            case "8":
            window.location.href = "https://ittza7aa.com/free/";
            break 
            case "9":
            window.location.href = "test";
            break 
            case "10":
            window.location.href = "test";
            break 
            
           ;
        default:
            errorMessage.innerHTML = "کۆدەکە هەڵەیە";
            errorMessage.style = "color: white; margin-top: 10px; font-family: 'RudawRegular';";
            break;
    }
});