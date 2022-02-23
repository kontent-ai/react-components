export var isComponent = function (node) {
    var _a;
    return ((_a = node.attributes.find(function (attr) { return attr.name === "data-rel"; })) === null || _a === void 0 ? void 0 : _a.value) === "component";
};
export var isLinkedItem = function (node) {
    var _a;
    return ((_a = node.attributes.find(function (attr) { return attr.name === "data-rel"; })) === null || _a === void 0 ? void 0 : _a.value) === "link";
};
//# sourceMappingURL=richTextUtils.js.map