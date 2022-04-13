import React from 'react';
import TestRenderer from 'react-test-renderer';
import { createDeliveryClient, Elements, ElementType } from '@kentico/kontent-delivery';
import complexRichTextItem from './complexRichTextItem.json';
import multiLevelComponentsRichText from './multiLevelComponentsRichText.json';
import { Element as ParserElement } from 'html-react-parser';
import { RichTextElement, isComponent, isLinkedItem, ResolverLinkedItemType } from '../../../src';
import { Element as DomHandlerElement } from 'domhandler';

// test('Parse rich text', () => {

//   var mockClient = createDeliveryClient({
//     projectId: 'dummyClient',
//   });

//   const response = mockClient.item("dummyItem")
//     .map(richTextItem);


//   const { debug } = render(<RichTextElement
//     richTextElement={response.item.elements["bio"] as Elements.RichTextElement}
//     linkedItems={response.linkedItems}
//     resolveLinkedItem={undefined}
//     resolveImage={undefined}
//     resolveLink={undefined}
//     resolveDomNode={undefined}
//   />);

//   debug();
// });

describe('<RichTextElement/>', () => {

  var mockClient = createDeliveryClient({
    projectId: 'dummyClient',
  });

  const complexItemResponse = mockClient.item("dummyItem")
    .map(complexRichTextItem);

  const emptyRichText = {
    value: '<p><br></p>',
    type: ElementType.RichText,
    name: "dummy",
    links: [],
    images: [],
    linkedItems: [],
    linkedItemCodenames: []
  }

  it('Empty rich-text value - render properly', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement richTextElement={emptyRichText}
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Simple rich-text value resolved simple dom node properly', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={{
          ...emptyRichText,
          value: "<p>Lorem ipsum with <strong>bold text</strong></p>"
        }}
        resolvers={{
          resolveDomNode: ({ domNode, domToReact }) => {
            if (domNode instanceof ParserElement) {
              if (domNode.name === "strong") {
                return <b>{domToReact(domNode.children)}</b>;
              }
            }
          }
        }}
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Simple rich-text value resolved when DOM Node was mutated', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={{
          ...emptyRichText,
          value: "<p>Lorem ipsum with <strong>bold text</strong></p>"
        }}
        resolvers={{
          resolveDomNode: ({ domNode, domToReact }) => {
            if (domNode instanceof DomHandlerElement) {
              if (domNode.name === "strong") {
                domNode.attribs.class = domNode.attribs.class
                  ? domNode.attribs.class + " strongClass"
                  : "strongClass";
                return undefined;
              }
              else if (domNode.name === "p") {
                domNode.attribs.class = domNode.attribs.class
                  ? domNode.attribs.class + " pClass"
                  : "pClass";
                return undefined;
              }
            }
          }
        }}
      />
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Complex rich-text value - render properly no resolution', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement richTextElement={
        complexItemResponse.item.elements["bio"] as Elements.RichTextElement
      } />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Resolve images', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={complexItemResponse.item.elements["bio"] as Elements.RichTextElement}
        resolvers={{
          resolveImage: (image, { domElement, domToReact }): JSX.Element => (
            <img
              src={image.url}
              alt={image.description ? image.description : image.imageId}
              width="200"
            />
          )
        }}
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Resolve links', () => {
    const complexValueRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={complexItemResponse.item.elements["bio"] as Elements.RichTextElement}
        resolvers={{
          resolveLink: (link, { domElement, domToReact }): JSX.Element => {
            return (
              <a href={`/${link.type}/${link.urlSlug}`}>
                {domToReact(domElement.children)}
              </a>
            );
          }
        }}
      />,
    );
    expect(complexValueRenderer.toJSON()).toMatchSnapshot();


    const simpleValueRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={{
          ...emptyRichText,
          value: '<p>This is the page text.</p><ul><li><a data-item-id="1abb6bf1-1e29-4deb-bb0c-b5928ffb0cc9" href="">Test link</a></li></ul>',
          links: [
            {
              urlSlug: "test-nico",
              type: "page",
              linkId: "1abb6bf1-1e29-4deb-bb0c-b5928ffb0cc9",
              codename: "test_page_nico"
            }
          ]
        }
        }
        resolvers={{
          resolveLink: (link, { domElement, domToReact }): JSX.Element => {
            return (
              // normally a Link component from gatsby package would be used
              <a href={`/${link.type}/${link.urlSlug}`}>
                {domToReact(domElement.children)}
              </a>
            );
          }
        }}
      />,
    );
    expect(simpleValueRenderer.toJSON()).toMatchSnapshot();
  });

  describe('Resolve linked items from richText element', () => {
    it('with richText containing single level of linked items', () => {
      const testRenderer = TestRenderer.create(
        <RichTextElement
          richTextElement={complexItemResponse.item.elements["bio"] as Elements.RichTextElement}
          resolvers={{
            resolveLinkedItem: (linkedItem, { domElement, domToReact }) => {
              if (isComponent(domElement)) {
                return (
                  <>
                    <h1>Component</h1>
                    <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
                  </>
                );
              }

              if (isLinkedItem(domElement)) {
                return (
                  <>
                    <h1>Linked item</h1>
                    <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
                  </>
                );
              }

              throw new Error("Unknown type of the linked item's dom node");
            }
          }}
        />,
      );
      expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    describe('with richText containing multiple level of linked items', () => {

      const multiLevelComponentsRichTextItem = mockClient.item("dummyItem")
        .map(multiLevelComponentsRichText);

      const resolveLinkedItemsRecursively: ResolverLinkedItemType = (linkedItem, _domNode) => {

        expect(linkedItem).toBeDefined();

        switch (linkedItem?.system.type) {
          case "row":
            return (
              <div className='row'>
                <RichTextElement
                  richTextElement={linkedItem?.elements["columns"] as Elements.RichTextElement}
                  resolvers={{
                    resolveLinkedItem: resolveLinkedItemsRecursively
                  }}
                />
              </div>
            );
          case "column":
            return (
              <div className='column'>
                <RichTextElement
                  richTextElement={linkedItem?.elements["content"] as Elements.RichTextElement}
                  resolvers={{
                    resolveLinkedItem: resolveLinkedItemsRecursively
                  }}
                />
              </div>
            )
        };
      }

      it('does not resolve lower level without linkedItems attribute', () => {
        const testRenderer = TestRenderer.create(
          <RichTextElement
            richTextElement={multiLevelComponentsRichTextItem.item.elements["content"] as Elements.RichTextElement}
            resolvers={{
              resolveLinkedItem: resolveLinkedItemsRecursively
            }}
          />,
        );
        expect(testRenderer.toJSON()).toMatchSnapshot();
      });
    });

  });

  it('Resolve geneal node - wrap table element', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={complexItemResponse.item.elements["bio"] as Elements.RichTextElement}
        resolvers={{
          resolveDomNode: ({ domNode, domToReact }) => {
            if (domNode instanceof DomHandlerElement && domNode.name === 'table') {
              return <div className="table-wrapper">{domToReact([domNode])}</div>;
            }
          }
        }}
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});

