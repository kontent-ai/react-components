import React from 'react';
import { render, screen } from '@testing-library/react';
import ReactRichTextElement from './ReactRichTextElement';
import { createDeliveryClient, Elements, linkedItemsHelper } from '@kentico/kontent-delivery';
import richTextItem from './richTextItem.json';

test('Parse rich text', () => {

  var mockClient = createDeliveryClient({
    projectId: 'dummyClient',
  });

  const response = mockClient.item("dummyItem")
    .map(richTextItem);


  const { debug } = render(<ReactRichTextElement
    richTextElement={response.item.elements["bio"]}
    linkedItems={response.linkedItems}
    resolveLinkedItem={undefined}
    resolveImage={undefined}
    resolveLink={undefined}
    resolveDomNode={undefined}
    className={undefined}
  />);

  debug();
});
