import { Element as DomHandlerElement } from "domhandler";

export const isComponent = (node: DomHandlerElement): boolean => {
    return node.attributes.find(attr => attr.name === "data-rel")?.value === "component";
}

export const isLinkedItem = (node: DomHandlerElement): boolean => {
    return node.attributes.find(attr => attr.name === "data-rel")?.value === "link";
}