import React, { ReactElement } from 'react'
import { Elements, IContentItem, browserParser, createRichTextObjectResolver, IRichTextObjectItem, BrowserParser } from "@kentico/kontent-delivery";

interface ReactRichTextElementProps {
    element: Elements.RichTextElement,
    linkedItems: IContentItem[]
}

function createReactElements(element: Elements.RichTextElement, linkedItems: IContentItem[], currentItem: IRichTextObjectItem): ReactElement {

    const attrs = Object.assign({}, ...currentItem.attributes.filter(attr => attr.name !== 'sdk-elem-id').map(attr => ({ [attr.name]: attr.value })))
    attrs.key = currentItem.attributes.find(attr => attr.name === 'sdk-elem-id')?.value;

    let children: ReactElement | ReactElement[] | undefined = undefined;

    if (currentItem.children.length > 0) {
        children = currentItem.children.map(child => createReactElements(element, linkedItems, child))
    // } else if (currentItem.data.html) { // Use this one  consult possibilities with Richard // loosing link on "This is Ondřej Chrastina - Developer Advocate with Kentico Kontent.""
    //     children = currentItem.data.html;
    } else if (currentItem.data.text) {
        children = currentItem.data.text;
    }

    return React.createElement(
        currentItem.type === "root" ? "div" : currentItem.tag, // https://github.com/Kentico/kontent-delivery-sdk-js/issues/339
        attrs,
        children
    );
}

function ReactRichTextElement({ element, linkedItems }: ReactRichTextElementProps) {
    const resultObject = createRichTextObjectResolver().resolveRichText({
        element: element,
        linkedItems: linkedItems,
        cleanSdkIds: false
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
