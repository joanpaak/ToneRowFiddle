
class NoteMap {
    constructor() {
        // TODO: Make this changeable
        // TODO: These should be in an initializer method: that 
        // would make it easier to change the note map
        // TODO: move the defaultMap from MatrixHandler to HERE
        this.noteMap = new Map([
            ["c", 0],
            ["d", 2],
            ["e", 4],
            ["f", 5],
            ["g", 7],
            ["a", 9],
            ["b", 11]
        ]);

        this.allowedNames = "";

        this.noteMap.keys().forEach(
            key => this.allowedNames += key
        );
    }

    /**
     * Transforms a pitch class given as note name to a number.
     * Uses the attribute this.noteMap to do that.
     * @param {String} note name 
     * @returns {Number} Pitch class
     */
    stringToPC(note) {
        // TODO: Rename to stringToPitchClass or something like that
        let pc = this.noteMap.get(note.charAt(0));
        note = note.slice(1);

        let sharps = [...note.matchAll(/#/g)];
        let flats = [...note.matchAll(/b/g)];
        pc += sharps.length;
        pc -= flats.length;

        pc = Tools.capPc(pc);

        return pc;
    }

    /**
     * 
     * @param {String[]} stringArray 
     * @returns 
     */
    stringArrayToPCs(stringArray) {
        let pcArray = new Array(stringArray.length);

        for (let i = 0; i < pcArray.length; i++) {
            pcArray[i] = this.stringToPC(stringArray[i]);
        }

        return pcArray;
    }
}

class Tools {
    /**
     * Given an array of pitch classes, transposes them by the "by" argument.
     * @param {Number []} rowAsPcs 
     * @param {Number} by 
     * @returns The transposed row as an array.
     */
    static transpose(rowAsPcs, by) {
        let transposedRow = new Array(rowAsPcs.length);

        for (let i = 0; i < rowAsPcs.length; i++) {
            transposedRow[i] = Tools.capPc(rowAsPcs[i] + by);
        }

        return transposedRow;
    }

    /**
     * Caps the integer given as an input between [0, 11].
     * @param {Number} pc 
     * @returns The capped pitch class
     */
    static capPc(pc) {
        if (pc < 0) {
            pc += Math.ceil(Math.abs(pc / 12)) * 12;
        } else if (pc > 11) {
            pc = pc % 12;
        }

        return pc;
    }

    /**
     * Given an array of pitch classes, inverts it.
     * @param {Number []} rowAsPcs 
     * @returns Inverted row as an array
     */
    static invertRow(rowAsPcs) {
        let invertedRow = new Array(rowAsPcs.length);

        for (let i = 0; i < rowAsPcs.length; i++) {
            invertedRow[i] = Tools.capPc(-rowAsPcs[i]);
        }

        invertedRow = Tools.transpose(invertedRow, 12 - invertedRow[0] + rowAsPcs[0]);

        return invertedRow;
    }
}

class PrimeFormHandler {
    /**
     * Input is the table to which the prime forms should be printed
     * @param {HTMLElement} domElement 
     */
    constructor(domElement) {
        this.primeFormTable = domElement;
    }

    addPrimeForm(pcArray) {
        let primeForm = this.findPrimeForm(pcArray);

        this.createDomElements(pcArray, primeForm);
    }

    /**
     * 
     * @param {*} original 
     * @param {*} primeForm 
     */
    createDomElements(original, primeForm) {
        let newTr = document.createElement("tr");

        let originalTd = document.createElement("td");
        let primeFromTd = document.createElement("td");
        let removeTd = document.createElement("td");

        let removeBtn = document.createElement("button");

        removeBtn.innerText = "Remove";

        removeBtn.addEventListener("click", () => {
            newTr.remove();
        });

        originalTd.innerText = `{${original}}`;
        primeFromTd.innerText = `{${primeForm}}`;

        removeTd.appendChild(removeBtn);

        newTr.replaceChildren(...[
            originalTd,
            primeFromTd,
            removeTd
        ]);

        this.primeFormTable.appendChild(newTr);
    }

    /**
     * 
     * @param {Number[]} pcSet 
     * @returns The prime for of the set
     */
    findPrimeForm(pcSet) {
        let toneMatrix = new Array(pcSet.length);

        for (let i = 0; i < pcSet.length; i++) {
            toneMatrix[i] = new Array(pcSet.length);

            for (let j = 0; j < pcSet.length; j++) {
                toneMatrix[i][j] = (pcSet[i] - pcSet[j] + 12) % 12;
            }
        }

        let rs = this.rowSums(toneMatrix);
        let cs = this.colSums(toneMatrix);

        let minRow = this.min(rs);
        let minCol = this.min(cs);

        let pf = [];

        if (minRow.val < minCol.val) {
            pf = toneMatrix[minRow.ind];
        } else {
            pf = new Array(pcSet.length);

            for (let i = 0; i < pcSet.length; i++) {
                pf[i] = toneMatrix[i][minCol.ind];
            }
        }

        pf.sort((a, b) => (a - b));

        return pf;
    }

    /**
     * Following R, the first index is row.
     * @param {Number} matrix 
     * @returns Array of row sums
     */
    rowSums(matrix) {
        let sums = new Array(matrix.length).fill(0);

        for (let i = 0; i < sums.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                sums[i] += matrix[i][j];
            }
        }

        return sums;
    }

    /**
     * 
     * @param {Number[][]} matrix 
     * @returns column sums
     */
    colSums(matrix) {
        let sums = new Array(matrix[0].length).fill(0);

        for (let i = 0; i < sums.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                sums[j] += matrix[i][j];
            }
        }

        return sums;
    }

    /**
     * 
     * @param {Number[]} array 
     * @returns Object with attribute val and ind for value and index.
     */
    min(array) {
        let curMinInd = 0;
        let curMinVal = array[0];

        for (let i = 1; i < array.length; i++) {
            if (array[i] < curMinVal) {
                curMinInd = i;
                curMinVal = array[i];
            }
        }

        return {
            val: curMinVal,
            ind: curMinInd
        }
    }
}

class MatrixHandler {
    /**
     * 
     * @param {HTMLElement} domElement 
     */
    constructor(domElement) {
        this.defaultHighLightCol = "lightblue";
        this.highlightedRows = [];
        this.matrixHasBeenInitialized = false;
        this.toneMatrix = domElement;
    }

    /* PUBLIC METHODS */
    newMatrixFromRow(noteNameArray) {
        if (this.matrixHasBeenInitialized) {
            this.toneMatrix.replaceChildren([]);
            this.lut = [];
            this.highlightedRows = [];
            this.rowSize = -1;
        }

        this.matrixHasBeenInitialized = true;

        this.rowSize = noteNameArray.length;

        this.initializeDOMElements();
        this.fillMatrix(noteNameArray);
        this.createLUT();
    }

    highlightRows(pcString) {
        if(pcString.match(/[a-z]/) != null){
            throw new Error("Letters in PC string!");
        }
        if (pcString === undefined) {
            throw new Error("Pc string was undefined!");
        }

        this.removeHighlights();

        for (let i = 0; i < this.lut.length; i++) {
            if (this.lut[i].rowString.match(pcString) != null) {
                this.highlightRow(this.lut[i]);
                this.highlightedRows.push(i);
            }
        }
    }

    /* PRIVATE METHODS */

    /**
    * Creates the DOM elements for the tone matrix.
    */
    initializeDOMElements() {
        /* Empty matrix */
        for (let i = 0; i < (this.rowSize + 2); i++) {
            let newRow = document.createElement("tr");

            for (let i = 0; i < (this.rowSize + 2); i++) {
                let newTd = document.createElement("td");
                newRow.appendChild(newTd);
            }

            this.toneMatrix.appendChild(newRow);
        }

        /* Margins */

        for (let i = 0; i < (this.rowSize + 2); i++) {
            this.toneMatrix.children[0].children[i].style.border = "none";

            if (i > 0 & i < (this.rowSize + 1)) {
                this.toneMatrix.children[0].children[i].innerText = `I-${i - 1}`;
                this.toneMatrix.children[0].children[i].style.transform = "rotate(270deg)";
            }
        }

        for (let i = 0; i < (this.rowSize + 2); i++) {
            this.toneMatrix.children[this.rowSize + 1].children[i].style.border = "none";

            if (i > 0 & i < (this.rowSize + 1)) {
                this.toneMatrix.children[this.rowSize + 1].children[i].innerText = `RI-${i - 1}`;
                this.toneMatrix.children[this.rowSize + 1].children[i].style.transform = "rotate(270deg)";
            }
        }

        for (let i = 0; i < (this.rowSize + 2); i++) {
            this.toneMatrix.children[i].children[0].style.border = "none";

            if (i > 0 & i < (this.rowSize + 1)) {
                this.toneMatrix.children[i].children[0].innerText = `P-${i - 1}`;
            }
        }

        for (let i = 0; i < (this.rowSize + 2); i++) {
            this.toneMatrix.children[i].children[this.rowSize + 1].style.border = "none";

            if (i > 0 & i < (this.rowSize + 1)) {
                this.toneMatrix.children[i].children[this.rowSize + 1].innerText = `R-${i - 1}`;
            }
        }

        /* Set style for the center tiles and event listener for changing note names*/

        for (let i = 1; i < (this.rowSize + 1); i++) {
            for (let j = 1; j < (this.rowSize + 1); j++) {
                this.toneMatrix.children[i].children[j].classList.add("toneCell");
                this.toneMatrix.children[i].children[j].contentEditable = true;
            }
        }
    }

    fillMatrix(noteNames) {
        let N = noteNames.length;
        let pitchClasses = new Array(N);
        let pcToNoteNameMap = new Map();

        /* The point in all this madness is that the tone row does 
           not necessarily contain all pitches. We have to impute the
           missing ones. This is the default imputing scheme. */
        // TODO: This probably should be part of NoteMap
        let defaultKeys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        let defaultVals = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

        for (let i = 0; i < 12; i++) {
            defaultKeys[i] = Tools.capPc(defaultKeys[i] - GLOBAL_NOTEMAP.stringToPC(noteNames[0]));
            pcToNoteNameMap.set(defaultKeys[i], defaultVals[i]);
        }

        /* TODO: For rows that don't contain all 12 notes, we have to create a 
        default pcToNoteNameMap. Then we can replace entries that exist. 
        But for now there's a hard-coded default map.*/

        for (let i = 0; i < N; i++) {
            // TODO: This substracting thing REALLY bugs me! Also it
            // is NOT in line with how the rowStrings are in the LUT!!!
            pitchClasses[i] = Tools.capPc(
                GLOBAL_NOTEMAP.stringToPC(noteNames[i]) - GLOBAL_NOTEMAP.stringToPC(noteNames[0]));
            pcToNoteNameMap.set(pitchClasses[i], noteNames[i]);
        }

        let invertedRow = Tools.invertRow(pitchClasses);

        for (let i = 0; i < N; i++) {
            let curRow = Tools.transpose(pitchClasses, invertedRow[i]);

            for (let j = 0; j < N; j++) {
                this.toneMatrix.children[i + 1].children[j + 1].innerText =
                    pcToNoteNameMap.get(curRow[j]);
            }
        }
    }

    createLUT() {
        this.lut = new Array();

        for (let i = 1; i < (this.rowSize + 1); i++) {
            let newEntryP = {
                direction: 0,
                col: null,
                row: i,
                rowString: ""
            }

            let newEntryR = {
                direction: 1,
                col: null,
                row: i,
                rowString: ""
            }

            let newEntryI = {
                direction: 0,
                col: i,
                row: null,
                rowString: ""
            }

            let newEntryRI = {
                direction: 1,
                col: i,
                row: null,
                rowString: ""
            }

            for (let j = 1; j < (this.rowSize + 1); j++) {
                newEntryP.rowString += GLOBAL_NOTEMAP.stringToPC(
                    this.toneMatrix.children[i].children[j].innerText) + " ";
                newEntryR.rowString += GLOBAL_NOTEMAP.stringToPC(
                    this.toneMatrix.children[i].children[this.rowSize + 1 - j].innerText) + " ";

                newEntryI.rowString += GLOBAL_NOTEMAP.stringToPC(
                    this.toneMatrix.children[j].children[i].innerText) + " ";
                newEntryRI.rowString += GLOBAL_NOTEMAP.stringToPC(
                    this.toneMatrix.children[this.rowSize + 1 - j].children[i].innerText) + " ";
            }

            this.lut.push(newEntryP);
            this.lut.push(newEntryR);
            this.lut.push(newEntryI);
            this.lut.push(newEntryRI);
        }
    }

    /**
   * Highlights the row at index entry.
   * @param {Number} entry 
   * @param {String} color 
   */
    highlightRow(entry, color) {
        if (color === undefined) color = this.defaultHighLightCol;

        if (entry.col === null) {
            for (let i = 0; i < this.rowSize + 1; i++) {
                this.toneMatrix.children[entry.row].
                    children[i + entry.direction].style.backgroundColor = color;
            }
        } else if (entry.row === null) {
            for (let i = 0; i < this.rowSize + 1; i++) {
                this.toneMatrix.children[i + entry.direction].
                    children[entry.col].style.backgroundColor = color;
            }
        } else {
            throw new Error("Could not highlight row!");
        }
    }

    removeHighlights() {
        for (let i = 0; i < this.highlightedRows.length; i++) {
            this.highlightRow(this.lut[this.highlightedRows[i]], "rgba(0, 0, 0, 0)");
        }

        this.highlightedRows = [];
    }
}

class GUIController {
    constructor() {
        this.displays = {
            matrixDisplay : 
                document.getElementById("matrixDisplay"),
            primeFormFinderDisplay:
                document.getElementById("primeFormFinderDisplay"),
            helpDisplay:
                document.getElementById("helpDisplay")
        };

        document.getElementById("findPrimeFormBtn").addEventListener("click", 
            e => this.readPrimeFormInput()
        );

        /* TOP PANEL  */

        document.getElementById("matrixBtn").addEventListener("click",
            e => this.switchDisplay("matrixDisplay")
        );
        document.getElementById("primeFormFinderBtn").addEventListener("click",
            e => this.switchDisplay("primeFormFinderDisplay")
        );
        document.getElementById("helpBtn").addEventListener("click",
            e => this.switchDisplay("helpDisplay")
        );


        this.rowSelector = document.getElementById("rowSelector");
        document.getElementById("loadRowBtn").addEventListener("click", 
            () => this.loadRow()
        );

        this.rowInput = document.getElementById("rowInput");
        this.fragmentInput = document.getElementById("fragmentInput");
        this.primeFormInput = document.getElementById("primeFormInput");

        this.rowInput.addEventListener("keydown", e => {
            if(e.key === "Enter") {
                this.readRowInput();
            }
        });

        this.fragmentInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                this.readFragmentInput();
            }
        });

        this.primeFormInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                this.readPrimeFormInput()
            }
        });

        /* */

        this.primeFormHandler = new PrimeFormHandler(
            document.getElementById("primeFormTable")
        );
        this.matrixHandler = new MatrixHandler(
            document.getElementById("toneMatrix"))
    }

    readRowInput() {
        let string = this.rowInput.value;
        if(string.length === 0) return;

        string = this.tidyString(string);

        if(!this.inputHasOnlyNoteNames(string)){
            return;
        }

        if(!this.noteNamesAreValid(string)) {
            return;
        }
        console.log("Reading row input...");

        this.matrixHandler.newMatrixFromRow(string.split(" "));
    }

    readFragmentInput() {
        let string = this.fragmentInput.value;

        if(string.length === 0) {
            this.matrixHandler.removeHighlights();
            return;
        }
        string = this.tidyString(string);

        if(!this.inputHasOnlyNoteNames(string)){
            return;
        }

        if (!this.noteNamesAreValid(string)) {
            return;
        }

        let pcArray = GLOBAL_NOTEMAP.stringArrayToPCs(string.split(" "));

        let pcString = pcArray.toString().replaceAll(",", " ");

        this.matrixHandler.highlightRows(pcString);
    }

    readPrimeFormInput() {
        let string = this.primeFormInput.value;

        if(string.length === 0) return;

        string = this.tidyString(string);

        if(!this.inputHasOnlyOneType(string)) {
            return;
        }

        let pcArray = [];

        // This means "if user input note names instead of PC's"
        if (string.match(/[a-z]/) != null) {
            if (!this.noteNamesAreValid(string)) {
                return;
            }
            pcArray = GLOBAL_NOTEMAP.stringArrayToPCs(string.split(" "));
        } else {
            pcArray = string.split(" ");
            
            for(let i = 0; i < pcArray.length; i++){
                pcArray[i] = Tools.capPc(parseInt(pcArray[i]));
            }
        }

        this.primeFormHandler.addPrimeForm(pcArray);
    }

    /* */

    switchDisplay(displayId){
        this.displays.matrixDisplay.style.display  = "none";
        this.displays.primeFormFinderDisplay.style.display  = "none";
        this.displays.helpDisplay.style.display  = "none";
        this.displays[displayId].style.display = "block";
    }

    /* String processing */

    tidyString(string) {
        string = string.trim();
        string = string.toLowerCase();
        string = string.replaceAll(/\s\s*/g, " ");

        return string;
    }

    inputHasOnlyNoteNames(string){
        if(string.match(/[^ #a-z]/) != null){
            if(string.match(/[0-9]/) != null){
                alert("Please input only note names.")
                return false;
            }

            alert("Please check your input: found unexpected symbols.");
            return false;
        }

        return true;
    }

    inputHasOnlyOneType(string) {
        let letterMatches = string.match(/[a-z]/);
        let numberMatches = string.match(/[0-9]/);

        if (letterMatches != null & numberMatches != null) {
            alert("Found letters and numbers in your input.\n" +
                "Please input only note names or pitch classes"
            );

            return false;
        }

        return true;
    }

    noteNamesAreValid(string) {
        string = string.replaceAll(" ", "");

        /* TODO: This check should not be necessary: 
           if the input is empty or does not contain 
           letters should ALWAYS be already detected
           before reaching this part. */
        let letters = string.match(/[a-z]/g);
        if (letters === null) return;

        letters = letters.toString().replaceAll(",", "");

        let regex = new RegExp(`[${GLOBAL_NOTEMAP.allowedNames}]`, "g");
        let nn = letters.match(regex).toString().replaceAll(",", "");

        if (nn.length != letters.length) {
            alert("Check input! Did you input letters that are not valid note names?");
            return false;
        }

        let nonLetters = string.match(/[^a-ö]/g);
        if (nonLetters === null) return true;

        nonLetters = nonLetters.toString().replaceAll(",", "")
        let crosses = nonLetters.match(/[#b]/g).toString().replaceAll(",", "");

        if (nonLetters.length != crosses.length) {
            alert("Check input! Did you use other symbols besides crosses?");
            return false;
        }

        return true;
    }

    /* */

    parseSavedRows() {
        this.rowSelector.replaceChildren([]);

        for (let i = 0; i < SAVED_ROWS.length; i++) {
            let newOption = document.createElement("option");
            newOption.innerText = SAVED_ROWS[i].name;
            newOption.tones = SAVED_ROWS[i].tones;
            this.rowSelector.appendChild(newOption);
        }
    }

    loadRow() {
        for (let i = 0; i < SAVED_ROWS.length; i++) {
            if (SAVED_ROWS[i].name === this.rowSelector.value) {
                this.rowInput.value = SAVED_ROWS[i].tones;
                this.readRowInput();

                return;
            }
        }

        alert(`Could not find row ${this.rowSelector.value}`);
    }
}

// MAIN PROGRAM

let GLOBAL_NOTEMAP = new NoteMap();
let guiController = new GUIController();
guiController.parseSavedRows();
