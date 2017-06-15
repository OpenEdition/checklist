const Base = require("./base.js");
const Marker = require("./marker.js");
const {getIdFromName} = require("./utils.js");

// Get values from check, otherwise default values are inherited from check
function assignAttributes ({attributes, statement, infos, check}) {
  attributes.forEach((attr) => {
    statement[attr] = infos[attr] || check[attr];
  });
}

class Statement extends Base {
  constructor ({check, infos, caller}) {
    super("Statement", caller);
    this.check = check;
    this.docId = check.docId;
    this.markers = [];

    assignAttributes({
      attributes: ["name", "description", "id", "type"],
      statement: this,
      infos,
      check
    });
    this.count = 1;

    // If no id then create it from name
    if (this.id == null) {
      this.id = getIdFromName(this.name);
    }

    // Use a default type is no type defined
    if (this.type == null) {
      const defaultType = "info";
      this.type = defaultType;
    }

    // If infos is a string, then use it as the name
    if (typeof infos === "string") {
      this.name = infos;
      this.id = getIdFromName(this.name);
    }

    // Do we have a name here?
    if (this.name == null) {
      throw Error("Statement constructor requires a name at least");
    }

    // Generate an new id from name if only the name was specified
    if (infos.name && infos.id == null) {
      this.id = getIdFromName(this.name);
    }
  }

  add (nb = 1) {
    this.count += nb;
  }

  getDuplicate () {
    return this.check.statements.find((el) => {
      return this.is(el);
    });
  }

  is (statement) {
    return this.id === statement.id;
  }

  inject (target) {
    const injectMarkers = () => {
      this.markers.forEach((marker) => {
        marker.inject();
      });
    };

    const getHtml = () => {
      const countSpan = (this.count && this.count > 1) ? `<span class="checklist-count">${this.count}</span>` : "";
      const type = this.type;
      const typeClass = type ? `checklist-statement-type-${type}` : "";
      const li = `<li class="checklist-statement ${typeClass}">${this.name} ${countSpan}</li>`;
      return li;
    };

    injectMarkers();

    const html = getHtml();
    const $element = $(html);

    const scrollToNextMarker = () => {
      const markers = this.markers;
      if (!markers || markers.length === 0) return;

      const winPos = $(window).scrollTop();
      const isBottomReached = winPos + $(window).height() > $(document).height() - 50;
      const tops = markers.map((marker) => {
        return $(marker.element).offset().top;
      });
      const nextTop = tops.find((top) => {
        return top > winPos + 10;
      });

      if (!isBottomReached && nextTop) {
        return $(window).scrollTop(nextTop);
      }
      $(window).scrollTop(tops[0]);
    };

    $element.click(scrollToNextMarker);
    $(target).append($element);
  }

  // In rules, set: label = { target, name[, position, type] }
  addMarker (options) {
    const createMarker = (singleTarget, options) => {
      const overwriting = {target: singleTarget, caller: this};
      const newOptions = Object.assign({}, options, overwriting);
      const marker = new Marker(newOptions);
      this.markers.push(marker);
      this.emit("marker", marker);
    };

    // Make sure target is one single element
    const $target = $(options.target);
    $target.each(function () {
      createMarker($(this), options);
    });
    return this;
  }

  export () {
    const {name, description, id, type, count} = this;
    return {name, description, id, type, count};
  }
}

module.exports = Statement;
