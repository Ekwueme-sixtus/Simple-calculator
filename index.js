// DOM Elements
const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expressionDisplay');
const clearButton = document.getElementById('clear');
const equalsButton = document.getElementById('equals');
const backspaceButton = document.getElementById('backspace');
const clearHistoryButton = document.getElementById('clearHistory');
const historyList = document.getElementById('historyList');
const modeToggle = document.getElementById('modeToggle');
const digitButtons = document.querySelectorAll('.digit');
const operatorButtons = document.querySelectorAll('.operator');

// Calculator state
let currentInput = '0';
let previousInput = '';
let operator = null;
let waitingForNewInput = false;
let calculationHistory = [];

// Initialize the calculator
function initCalculator() {
    updateDisplay();
    
    // Add event listeners to digit buttons
    digitButtons.forEach(button => {
        button.addEventListener('click', () => {
            inputDigit(button.getAttribute('data-digit'));
        });
    });
    
    // Add event listeners to operator buttons
    operatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            inputOperator(button.getAttribute('data-operator'));
        });
    });
    
    // Clear button
    clearButton.addEventListener('click', clearCalculator);
    
    // Equals button
    equalsButton.addEventListener('click', calculateResult);
    
    // Backspace button
    backspaceButton.addEventListener('click', handleBackspace);
    
    // Clear history button
    clearHistoryButton.addEventListener('click', clearHistory);
    
    // Dark/light mode toggle
    modeToggle.addEventListener('click', toggleDarkMode);
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Load history from localStorage if available
    loadHistory();
}

// Update the display
function updateDisplay() {
    display.value = currentInput;
    expressionDisplay.textContent = previousInput + (operator ? ' ' + operator : '');
}

// Handle digit input
function inputDigit(digit) {
    if (waitingForNewInput) {
        currentInput = digit;
        waitingForNewInput = false;
    } else {
        currentInput = currentInput === '0' ? digit : currentInput + digit;
    }
    updateDisplay();
}

// Handle operator input
function inputOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);
    
    if (previousInput === '' && operator === null) {
        // First operator input
        previousInput = currentInput;
    } else if (operator) {
        // Calculate intermediate result
        const result = calculate(parseFloat(previousInput), inputValue, operator);
        currentInput = String(result);
        previousInput = currentInput;
    }
    
    waitingForNewInput = true;
    operator = nextOperator;
    updateDisplay();
}

// Calculate the result
function calculateResult() {
    if (operator === null || waitingForNewInput) {
        return;
    }
    
    const inputValue = parseFloat(currentInput);
    const prevValue = parseFloat(previousInput);
    
    if (isNaN(prevValue) || isNaN(inputValue)) {
        return;
    }
    
    const result = calculate(prevValue, inputValue, operator);
    
    // Add to history
    const calculation = {
        expression: `${prevValue} ${operator} ${inputValue}`,
        result: result
    };
    
    addToHistory(calculation);
    
    // Update display with result
    currentInput = String(result);
    previousInput = '';
    operator = null;
    waitingForNewInput = true;
    updateDisplay();
    
    // Highlight the result
    display.classList.add('result-highlight');
    setTimeout(() => {
        display.classList.remove('result-highlight');
    }, 500);
}

// Perform calculation based on operator
function calculate(firstNum, secondNum, operator) {
    switch (operator) {
        case '+':
            return firstNum + secondNum;
        case '-':
            return firstNum - secondNum;
        case '×':
            return firstNum * secondNum;
        case '÷':
            if (secondNum === 0) {
                alert("Cannot divide by zero!");
                return 0;
            }
            return firstNum / secondNum;
        default:
            return secondNum;
    }
}

// Clear the calculator
function clearCalculator() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    waitingForNewInput = false;
    updateDisplay();
}

// Handle backspace
function handleBackspace() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Handle keyboard input
function handleKeyboardInput(event) {
    const key = event.key;
    
    // Prevent default behavior for calculator keys
    if (/[\d+\-*/.=]|Enter|Backspace|Escape/.test(key)) {
        event.preventDefault();
    }
    
    if (key >= '0' && key <= '9') {
        inputDigit(key);
    } else if (key === '.') {
        if (!currentInput.includes('.')) {
            inputDigit('.');
        }
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        // Map keyboard operators to calculator operators
        let operator;
        if (key === '*') operator = '×';
        else if (key === '/') operator = '÷';
        else operator = key;
        
        inputOperator(operator);
    } else if (key === 'Enter' || key === '=') {
        calculateResult();
    } else if (key === 'Escape' || key === 'Delete') {
        clearCalculator();
    } else if (key === 'Backspace') {
        handleBackspace();
    }
}

// Add calculation to history
function addToHistory(calculation) {
    calculationHistory.unshift(calculation);
    
    // Keep only the last 10 calculations
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }
    
    updateHistoryDisplay();
    saveHistory();
}

// Update history display
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    if (calculationHistory.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'history-item';
        emptyItem.innerHTML = '<span class="history-expression">No calculations yet</span>';
        historyList.appendChild(emptyItem);
        return;
    }
    
    calculationHistory.forEach(item => {
        const historyItem = document.createElement('li');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="history-expression">${item.expression} =</span>
            <span class="history-result">${item.result}</span>
        `;
        historyList.appendChild(historyItem);
    });
}

// Clear history
function clearHistory() {
    calculationHistory = [];
    updateHistoryDisplay();
    saveHistory();
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
}

// Load history from localStorage
function loadHistory() {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// Toggle dark/light mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        modeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        modeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
    
    // Save preference to localStorage
    localStorage.setItem('calculatorDarkMode', document.body.classList.contains('dark-mode'));
}

// Check for saved dark mode preference
function checkDarkModePreference() {
    const darkModePref = localStorage.getItem('calculatorDarkMode');
    
    if (darkModePref === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
}

// Initialize the calculator when the page loads
window.addEventListener('DOMContentLoaded', () => {
    checkDarkModePreference();
    initCalculator();
});