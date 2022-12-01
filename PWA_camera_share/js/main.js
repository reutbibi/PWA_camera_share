if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("../service-worker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}

// נשמור את אירוע ההתקנה במשתנה גלובלי כדי שנוכל להציגו מאוחר יותר
let deferredPrompt;

//מאזינים למסמך ובודקים מתי התוכן נטען
document.addEventListener("DOMContentLoaded", function (event) {
    window.addEventListener('beforeinstallprompt', (e) => {
        // נמנע הצגה של חלון ברירת מחדל במידה וקיים
        e.preventDefault();
        // נשמור את אירוע ההוספה למשתנה
        deferredPrompt = e;
        // נציג את כפתור ההתקנה שלנו
        showInstallPromotion();
    });
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        startVideo();
    } else {
        console.log("camera not supported");
    }
});

//פונקציה להצגת הכפתור
function showInstallPromotion() {
    document.getElementById("install-btn").classList.remove("d-none");
}

//פונקציה להסתרת הכפתור
function hideInstallPromotion() {
    document.getElementById("install-btn").classList.add("d-none");
}

//פונקציה להתקנת האפליקציה
function installApp() {
    // נסתיר את כפתור ההתקנה
    hideInstallPromotion();
    // נציג את חלונית ההתקנה
    deferredPrompt.prompt();
    // נרוקן את המשתנה בו שמרנו את האירוע, זהו אירוע חד פעמי
    deferredPrompt = null;
}

//הפעלת וידאו
async function startVideo() {
    // נשמור את תג הוידאו לתוך משתנה
    const player = document.getElementById('player');
    // נגדיר דרישות למדיה - נרצה להציג רק וידאו מהמצלמה האחורית
    const constraints = {
        audio: false,
        video: {
            facingMode: 'environment'
        }
    };
    //במידה ונצליח לפנות למצלמה, נזרים את הוידאו לתג הוידאו
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (mediaStream) {
            player.srcObject = mediaStream;
        })
        .catch(function (err) { console.log(err.name + ": " + err.message); });
}


//צילום תמונה
function doScreenshot() {
    const canvas = document.getElementById('canvas');
    // נרצה לשמור על הפרופורציות של הוידאו
    canvas.width = player.videoWidth;
    canvas.height = player.videoHeight;
    // נצייר את הפריים הנוכחי על גבי הקנבס
    canvas.getContext('2d').drawImage(player, 0, 0);
    //נמיר את הקנבס לפורמט של תמונה 
    document.getElementById('photo')
        .src = canvas.toDataURL('image/jpeg');
    // נציג את הקנבס
    canvas.classList.remove('d-none');
};

//המרה מ-URL לקובץ
function dataURLtoFile(dataUrl, fileName) {
    var arr = dataUrl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
}

//שיתוף הקובץ
function share() {
    var fileToSend = dataURLtoFile(document.getElementById('photo').src, "ImageProg3.jpeg")
    var filesArray = [fileToSend];
    //בדיקה האם ניתן לשתף
    if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        navigator.share({
            files: filesArray,
        })
            .then(() => console.log('Share was successful.'))
            .catch((error) => console.log('Sharing failed', error));
    } else {
        console.log(`Your system doesn't support sharing files.`);
    }
}
