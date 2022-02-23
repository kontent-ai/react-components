var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx } from "react/jsx-runtime";
import parseHTML, { domToReact } from "html-react-parser";
import { Element as DomHandlerElement } from "domhandler";
var IMAGE_ID_ATTRIBUTE_IDENTIFIER = "data-image-id";
var LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER = "data-item-id";
var isLinkedItem = function (domNode) {
    var _a;
    if (domNode instanceof DomHandlerElement) {
        return domNode.tagName === "object" && ((_a = domNode.attributes.find(function (attr) { return attr.name === "type"; })) === null || _a === void 0 ? void 0 : _a.value) === "application/kenticocloud";
    }
    return false;
};
var isImage = function (domNode) {
    var _a;
    if (domNode instanceof DomHandlerElement) {
        return domNode.tagName === "figure" && ((_a = domNode.attributes.find(function (attr) { return attr.name === IMAGE_ID_ATTRIBUTE_IDENTIFIER; })) === null || _a === void 0 ? void 0 : _a.value) !== "undefined";
    }
    return false;
};
var isLinkedItemLink = function (domNode) {
    var _a;
    if (domNode instanceof DomHandlerElement) {
        return domNode.tagName === "a" && ((_a = domNode.attributes.find(function (attr) { return attr.name === LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER; })) === null || _a === void 0 ? void 0 : _a.value) !== "undefined";
    }
    return false;
};
var replaceNode = function (domNode, richTextElement, linkedItems, resolveLinkedItem, resolveImage, resolveLink, resolveDomNode) {
    var _a, _b, _c;
    var images = richTextElement.images, links = richTextElement.links;
    if (resolveLinkedItem && linkedItems) {
        if (isLinkedItem(domNode)) {
            var node = domNode;
            var codeName = (_a = node === null || node === void 0 ? void 0 : node.attributes.find(function (attr) { return attr.name === "data-codename"; })) === null || _a === void 0 ? void 0 : _a.value;
            var linkedItem = codeName ? linkedItems[codeName] : undefined;
            return resolveLinkedItem(linkedItem, node, domToReact);
        }
    }
    if (resolveImage && images) {
        if (isImage(domNode)) {
            var node = domNode;
            var imageId_1 = (_b = node === null || node === void 0 ? void 0 : node.attributes.find(function (attr) { return attr.name === IMAGE_ID_ATTRIBUTE_IDENTIFIER; })) === null || _b === void 0 ? void 0 : _b.value;
            var image = images.find(function (image) { return image.imageId === imageId_1; });
            if (image) {
                return resolveImage(image, node, domToReact);
            }
        }
    }
    if (resolveLink && links) {
        if (isLinkedItemLink(domNode)) {
            var node = domNode;
            var linkId_1 = (_c = node === null || node === void 0 ? void 0 : node.attributes.find(function (attr) { return attr.name === LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER; })) === null || _c === void 0 ? void 0 : _c.value;
            var link = links.find(function (link) { return link.linkId === linkId_1; });
            if (link) {
                return resolveLink(link, node, domToReact);
            }
        }
    }
    if (resolveDomNode) {
        return resolveDomNode(domNode, domToReact);
    }
};
;
;
var RichTextElement = function (_a) {
    var richTextElement = _a.richTextElement, linkedItems = _a.linkedItems, resolveLinkedItem = _a.resolveLinkedItem, resolveImage = _a.resolveImage, resolveLink = _a.resolveLink, resolveDomNode = _a.resolveDomNode, className = _a.className;
    var cleanedValue = richTextElement.value.replace(/(\n|\r)+/, "");
    var result = parseHTML(cleanedValue, {
        replace: function (domNode) { return replaceNode(domNode, richTextElement, linkedItems, resolveLinkedItem, resolveImage, resolveLink, resolveDomNode); },
    });
    return (_jsx("div", __assign({ className: className }, { children: result }), void 0));
};
export { RichTextElement };
//# sourceMappingURL=index.js.map