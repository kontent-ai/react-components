import React, { ReactElement } from 'react'
import { Elements, IContentItem, browserParser, createRichTextObjectResolver, IRichTextObjectItem } from "@kentico/kontent-delivery";

interface ReactRichTextElementProps {
    element: Elements.RichTextElement,
    linkedItems: IContentItem[]
}

function createReactElements(element: Elements.RichTextElement, linkedItems: IContentItem[], currentItem: IRichTextObjectItem): ReactElement {

    console.log(currentItem.type);

    return React.createElement(
        currentItem.tag,
        Object.assign({}, ...currentItem.attributes.map(attr => ({ [attr.name]: attr.value }))),
        currentItem.children.length > 0 ? currentItem.children.map(child => createReactElements(element, linkedItems, child)) : undefined
    );
}

function ReactRichTextElement({ element, linkedItems }: ReactRichTextElementProps) {
    const resultObject = createRichTextObjectResolver().resolveRichText({
        element: element,
        linkedItems: linkedItems,
        cleanSdkIds: true
    });

    const root = createReactElements(element, linkedItems, resultObject.data);

    return root;

    // let elementCounter = 0;
    // let genericElementCounter = 0;
    // let urlResolverCounter = 0;
    // let imageResolverCounter = 0;
    // let contentItemResolverCounter = 0;
    // return = browserParser.parse(
    //     element.value,
    //     element,
    //     {
    //         elementResolver: (element) => {
    //             element.setAttribute("data-kontent-element-identification", `elementResolver ${elementCounter++}`);
    //         },
    //         genericElementResolver: (element) => {
    //             // console.log(element);
    //             // element.setAttribute("data-kontent-generic-element-identification", `genericElementResolver ${genericElementCounter++}`);
    //         },
    //         urlResolver: (element, linkId, linkText, link) => {
    //             // element.setAttribute("data-kontent-url-identification", `urlResolver ${urlResolverCounter++}`);

    //             // console.log(element);
    //             // console.log(linkId);
    //             // console.log(linkText);
    //             // console.log(link);

    //         },
    //         imageResolver: (element, imageId, image) => {
    //             // element.setAttribute("data-kontent-image-identification", `genericElementResolver ${imageResolverCounter++}`);
    //             // console.log(element);
    //             // console.log(imageId);
    //             // console.log(image);
    //         },
    //         contentItemResolver: (element, linkedItemCodename, linkedItemIndex, linkedItem?) => {
    //             // element.setAttribute("data-kontent-content-item-identification", `genericElementResolver ${contentItemResolverCounter++}`);
    //             // console.log(element);
    //             // console.log(linkedItemCodename);
    //             // console.log(linkedItemIndex);
    //             // console.log(linkedItem);
    //         }
    //     },
    //     linkedItems);
}

export default ReactRichTextElement
