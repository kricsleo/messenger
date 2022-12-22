export const meta = {
  description: 'Bonjour!',
  target: 'https://bing.com?key=demo'
}

export default function gitlab2WecomRobot(message: any) {
  return  {
    msgtype: 'markdown',
    markdown: {
      content: `
# ${message.project.name}
Message Received.
[detail](${message.repository.git_http_url})<@all>
      `,
    }
  }
}
