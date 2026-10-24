export const PROGRESS_KEY = "kurs:ukonczone"
export const TEACHER_KEY = "kurs:prowadzacy"

/** Skrypt uruchamiany przed pierwszym malowaniem, żeby tryb prowadzącego nie migał. */
export const teacherModeScript = `try{document.documentElement.dataset.prowadzacy=localStorage.getItem("${TEACHER_KEY}")==="1"?"1":"0"}catch(e){}`
