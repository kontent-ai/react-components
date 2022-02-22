import parseHTML, { domToReact, DOMNode, HTMLReactParserOptions } from "html-react-parser";

const IMAGE_ID_ATTRIBUTE_IDENTIFIER = "data-image-id";
const LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER = "data-item-id";

const isLinkedItem = (domNode: DOMNode): boolean => {
    if (domNode instanceof Element) {
        return domNode.tagName === "object" && domNode.attributes.getNamedItem("type")?.value === "application/kenticocloud";
    }
    return false;
}

function isImage(domNode: DOMNode): boolean {
    if (domNode instanceof Element) {
        return domNode.tagName === "object" && domNode.attributes.getNamedItem(IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value !== "undefined";
    }
    return false;
}

function isLink(domNode: DOMNode) {
    if (domNode instanceof Element) {
        return domNode.tagName === "a" && domNode.attributes.getNamedItem(IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value !== "undefined";
    }
    return false;
}

// @ts-ignore
function replaceNode(domNode: DOMNode, richTextElement, linkedItems, resolveLinkedItem, resolveImage, resolveLink, resolveDomNode, className ) {

    const { images, links } = richTextElement;
    if (resolveLinkedItem && linkedItems) {
        if (isLinkedItem(domNode)) {
            const node = domNode as unknown as Element;
            const codeName = node?.attributes.getNamedItem("data-codename")?.value;
            const linkedItem = codeName ? linkedItems[codeName] : undefined;
            return resolveLinkedItem(linkedItem, domNode, domToReact);
        }
    }

    if (resolveImage && images) {
        if (isImage(domNode)) {
            const node = domNode as unknown as Element;

            const imageId = node?.attributes.getNamedItem(IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value;
            const image = images.find((image: { imageId: string }) => image.imageId === imageId);
            return resolveImage(image, domNode, domToReact);
        }
    }

    if (resolveLink && links) {
        if (isLink(domNode)) {
            const node = domNode as unknown as Element;

            const linkId = node?.attributes.getNamedItem(LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER)?.value;
            const link = links.find((link: { linkId: string }) => link.linkId === linkId);
            return resolveLink(link, domNode, domToReact);
        }
    }

    if (resolveDomNode) {
        return resolveDomNode(domNode, domToReact);
    }
}

// @ts-ignore
function RichTextComponent({ richTextElement, linkedItems, resolveLinkedItem, resolveImage, resolveLink, resolveDomNode, className }): JSX.Element {
    const cleanedValue = richTextElement.value.replace(/(\n|\r)+/, "");
    const result = parseHTML(cleanedValue, {
        // @ts-ignore
        replace: (domNode) => replaceNode(domNode, richTextElement, linkedItems, resolveLinkedItem, resolveImage, resolveLink, resolveDomNode),
    });

    return (
        <div className={className} >
            {result}
        </div>
    );
}

export default RichTextComponent;