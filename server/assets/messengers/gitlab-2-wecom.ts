export const meta: Meta = {
  author: 'kricsleo',
  description: `Gitlab → 企微机器人消息通知`,
  standard: true
}

export default function (message: GitlabMessage): WecomRobotMarkdown | null {
  const content = getContent(message)
  if(!content) {
    return null
  }
  return {
    msgtype: 'markdown',
    markdown: { content }
  }
}

function getMRContent(message: GitlabMR): string {
  const { object_attributes } = message
  let mention = getMention(message.assignees, message.user)
  let action = ''
  switch(object_attributes.action) {
    case 'open': action = '创建';break;
    case 'close': action = '关闭';break;
    case 'reopen': action = '重新打开';break;
    case 'approved': action = '同意';break;
    case 'unapproved': action = '拒绝';break;
    case 'approval': action = '同意';break;
    case 'unapproval': action = '拒绝';break;
    case 'merge': action = '合并';break;
    case 'update': {
      const addedAssignees = message.changes.assignees?.current
        .filter(user => (message.changes.assignees?.previous || []).every(prevUser => prevUser.username !== user.username))
      const addedMention = getMention(addedAssignees, message.user)
      // only notify new assignee added currently
      if(addedMention) {
        action = '更新'
        mention = addedMention
      } else {
        return ''
      }
      break;
    };
    default: return ''
  }
  const content = 
`
## ${message.project.name}
> ✨ ${message.user.name}${action}了MR: [${object_attributes.source_branch} → ${object_attributes.target_branch}](${object_attributes.url})${mention}
`
  return content
}

function getCommentContent(message: GitlabComment): string {
  const { object_attributes, commit, merge_request, issue, snippet, user, project } = message
  let type = ''
  switch (object_attributes.noteable_type) {
    case 'Commit': type = `提交: [${commit!.title}](${object_attributes.url})`;break;
    case 'MergeRequest': type = `MR: [${merge_request!.source_branch} → ${merge_request!.target_branch}](${object_attributes.url})`;break;
    case 'Issue': type = `issue: [${issue!.title}](${object_attributes.url})`;break;
    case 'Snippet': type = `片段: [${snippet!.title}](${object_attributes.url})`;break;
    default: return ''
  }
  const content =
`
## ${message.project.name}
> 💬 ${user.name}评论了${type}
> ${transformGitlabMetion2WecomMention(object_attributes.note)}
`
  return content
}

function getPipelineContent(message: GitlabPipeline): string {
  const { object_attributes, project, builds, user, commit } = message
  let status = ''
  let href = ''
  // only notify pipelines when succeeded or failed
  switch (object_attributes.status) {
    case 'success': {
      href = `${project.web_url}/-/pipelines/${object_attributes.id}`
      status = `🚀 <font color="#22c55e">${object_attributes.ref}</font>的[流水线](${href})已经完成`
      break
    }
    case 'failed': {
      const failedJob = builds.find(job => job.status === 'failed')
      href = `${project.web_url}/-/jobs/${failedJob?.id}`
      status = `❌ 呃，<font color="#22c55e">${object_attributes.ref}</font>的[流水线](${href})失败了`
      break
    }
    default: return ''
  }
  const content = 
`
## ${message.project.name}
> ${status}，耗时${getTime(object_attributes.duration)}<@${user.username}>
> [${commit.title}](${commit.url})
`
  return content
}

function getContent(message: GitlabMessage): string {
  switch (message.object_kind) {
    case 'merge_request': return getMRContent(message);
    case 'pipeline': return getPipelineContent(message);
    case 'note': return getCommentContent(message);
    default: return ''
  }
}

function transformGitlabMetion2WecomMention(text: string) {
  // gitlab: @user -> wecom: <@user>
  return text.replace(/(?<=^|\s)@\S*(?=$|\s)/gm, '<$&>')
}

function getMention(users: User[] = [], filterUser?: User): string {
  return users.filter(user => user.username !== filterUser?.username)
    .map(user => `<@${user.username}>`)
    .join('') || ''
}

function getTime(time: number) {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return (minutes ? `${minutes}分` : '') + `${seconds}秒`
}

interface Meta {
  author: string
  description: string
  standard?: boolean
}
interface WecomRobotMarkdown {
  msgtype: 'markdown'
  markdown: {
    // "<@userid>" means the user, "<@all>" means all group members
    // maxlength: 4096b
    // encode: utf8
    content: string
  }
}
interface WecomRobotText {
  msgtype: 'text'
  text: {
    // "<@userid>" means the user, "<@all>" means all group members
    // maxlength: 2048b
    // encode: utf8
    content: string
    mentioned_list?: string[]
    mentioned_mobile_list?: string[]
  }
}
interface User {
  id: string
  name: string
  username: string
  avatar_url: string
}
interface Commit {
  id: string
  title: string
  message: string
  timestamp: string
  url: string
  author: {
    name: string
    email: string
  }
}
type GitlabJobStatus = 'created' | 'waiting_for_resource' | 'preparing' | 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped' | 'manual' | 'scheduled'
type MRState = 'opened' | 'closed' | 'locked' | 'merged'
type MRAction = 'open' | 'close' | 'reopen' | 'update' | 'approved' | 'unapproved' | 'approval' | 'unapproval' | 'merge'
interface Project {
  name: string
  web_url: string
}
interface GitlabMR {
  object_kind: 'merge_request'
  object_attributes: {
    title: string
    description: string
    state: MRState
    action: MRAction
    target_branch: string
    source_branch: string
    url: string
    last_commit: Commit
  }
  user: User
  project: Project
  assignees: User[]
  changes: {
    assignees?: {
      previous: User[]
      current: User[]
    }
  }
}
interface GitlabPipeline {
  object_kind: 'pipeline'
  object_attributes: {
    status: GitlabJobStatus
    duration: number
    ref: string
    id: string
  }
  commit: Commit
  builds: Array<{
    id: string
    stage: string
    status: GitlabJobStatus
    user: User
  }>
  user: User
  project: Project
}
interface GitlabComment {
  object_kind: 'note'
  object_attributes: {
    note: string
    url: string
    noteable_type: 'MergeRequest' | 'Commit' | 'Issue' | 'Snippet'
    system: boolean
  }
  commit?: Commit
  merge_request?: {
    source_branch: string
    target_branch: string
    last_commit: {
      author: {
        name: string
        email: string
      }
    }
  }
  user: User
  project: Project
  issue?: {
    title: string
  }
  snippet?: {
    title: string
  }
}
// @see https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html#merge-request-events
type GitlabMessage = GitlabMR | GitlabPipeline | GitlabComment
