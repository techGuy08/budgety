// js modules

let budgetController = (function() {
  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(total) {
    if (total > 0) {
      this.percentage = Math.round((this.value / total) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  let data = {
    allItems: {
      inc: [],
      exp: []
    },
    total: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: -1
  };
  let calcTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(element) {
      sum += element.value;
    });
    data.total[type] = sum;
  };
  return {
    addItem: function(type, desc, val) {
      let newItem, id;
      id =
        data.allItems[type].length > 0
          ? data.allItems[type][data.allItems[type].length - 1].id + 1
          : 0;
      if (type == "inc") {
        newItem = new Income(id, desc, val);
      } else if (type == "exp") {
        newItem = new Expense(id, desc, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id) {
      let ids, index;
      ids = data.allItems[type].map(function(el) {
        return el.id;
      });
      index = ids.indexOf(id);
      data.allItems[type].splice(index, 1);
    },
    calcBudget: function() {
      calcTotal("inc");
      calcTotal("exp");
      data.budget = data.total.inc - data.total.exp;
      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage
      };
    },
    calcPercentage: function() {
      data.allItems.exp.forEach(function(c) {
        c.calcPercentage(data.total.inc);
      });
    },
    getPercentage: function() {
      let allper = data.allItems.exp.map(function(c) {
        return c.getPercentage();
      });
      return allper;
    }
  };
})();

let UIController = (function() {
  let DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetValue: ".budget__value",
    incomeValue: ".budget__income--value",
    incomePercentage: ".budget__income--percentage",
    expenseValue: ".budget__expenses--value",
    expensePercentage: ".budget__expenses--percentage",
    itemPercentage: ".item__percentage",
    container: ".container",
    MonthValue: ".budget__title--month"
  };
  let formatNumber = function(num, type) {
    let numSplit, int, dec;
    num = Math.abs(num).toFixed("2");
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3 && int.length <= 6) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    } else if (int.length > 6) {
      int =
        int.substr(0, int.length - 6) +
        "," +
        int.substr(int.length - 6, 3) +
        "," +
        int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    return (
      (type == "inc" && parseInt(int) !== 0
        ? "+"
        : parseInt(int) == 0
        ? ""
        : "-") +
      " " +
      int +
      "." +
      dec
    );
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    getDOMstrings: function() {
      return DOMstrings;
    },
    addListItem: function(obj, type) {
      let newHtml, el;
      if (type == "inc") {
        el = DOMstrings.incomeContainer;
        newHtml =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        newHtml = newHtml.replace("%value%", formatNumber(obj.value, "inc"));
      } else if (type == "exp") {
        el = DOMstrings.expenseContainer;
        newHtml =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%per%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        newHtml = newHtml.replace("%per%", obj.percentage);
        newHtml = newHtml.replace("%value%", formatNumber(obj.value, "exp"));
      }
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%id%", obj.id);

      document.querySelector(el).innerHTML += newHtml;
    },
    deleteListItem: function(id) {
      document.querySelector("#" + id).remove();
    },
    clearFields: function() {
      let fields;
      fields = document.querySelectorAll(
        DOMstrings.inputValue + " , " + DOMstrings.inputDescription
      );
      let fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(element => {
        element.value = "";
      });
      fieldsArr[0].focus();
    },
    showBudget: function(obj) {
      let type = obj.budget > 0 ? "inc" : "exp";
      document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expenseValue
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.expensePercentage).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.expensePercentage).textContent =
          "---";
      }
    },
    showPercentage: function(exps) {
      itemsPer = document.querySelectorAll(
        DOMstrings.expenseContainer + "> .item " + DOMstrings.itemPercentage
      );
      for (let i = 0; i < itemsPer.length; i++) {
        itemsPer[i].textContent = exps[i] + "%";
      }
    },
    showMonth: function(n = null) {
      let d = new Date();
      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      let m = d.getMonth();
      let y = d.getFullYear();
      if (n !== null) {
        m = n - 1;
      }
      document.querySelector(DOMstrings.MonthValue).textContent =
        months[m] + " " + y;
    },
    changeType: function() {
      let fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputValue +
          " , " +
          DOMstrings.inputDescription
      );
      let fieldsList = Array.prototype.slice.call(fields);
      fieldsList.forEach(function(el) {
        el.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
      fieldsList[1].focus();
    }
  };
})();

let controller = (function(budgetCtrl, UICtrl) {
  let setupEventListeners = function() {
    let DOMstrings = UICtrl.getDOMstrings();
    document
      .querySelector(DOMstrings.inputBtn)
      .addEventListener("click", ctrlAddItem);
    document.addEventListener("keydown", function(e) {
      if (e.code == "Enter") {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOMstrings.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOMstrings.inputType)
      .addEventListener("change", UICtrl.changeType);
  };
  let ctrlAddItem = function() {
    let input, newItem;
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
      updatePercentage();
    }
  };
  let ctrlDeleteItem = function(e) {
    let itemID, type, Id;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      type = itemID.split("-")[0];
      Id = parseInt(itemID.split("-")[1]);
      budgetCtrl.deleteItem(type, Id);
      UICtrl.deleteListItem(itemID);
      updateBudget();
      updatePercentage();
    }
  };
  let updateBudget = function() {
    budgetCtrl.calcBudget();
    let budget = budgetCtrl.getBudget();
    UICtrl.showBudget(budget);
  };
  let updatePercentage = function() {
    budgetCtrl.calcPercentage();
    let percentages = budgetCtrl.getPercentage();
    UICtrl.showPercentage(percentages);
  };
  return {
    init: function() {
      UICtrl.showBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
      UICtrl.showMonth();
    }
  };
})(budgetController, UIController);
controller.init();
