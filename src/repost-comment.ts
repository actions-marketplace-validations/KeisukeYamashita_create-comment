import * as core from '@actions/core'
import * as github from '@actions/github'

export interface Inputs {
  checkOnlyFirstline: boolean
  comment: string
  issueNumber: number
  repository: string
  token: string
}

export class Reposter {
  private checkOnlyFirstLine: boolean
  private comment: string
  private issueNumber: number
  private owner: string
  private repo: string
  private token: string

  constructor(inputs: Inputs) {
    this.checkOnlyFirstLine = inputs.checkOnlyFirstline
    this.issueNumber = inputs.issueNumber
    this.comment = inputs.comment

    const [owner, repo] = inputs.repository.split('/')
    this.owner = owner
    this.repo = repo
    this.token = inputs.token
  }

  async repostComment(): Promise<void> {
    const client = github.getOctokit(this.token)
    const {data: comments} = await client.issues.listComments({
      owner: this.owner,
      repo: this.repo,
      issue_number: this.issueNumber
    })

    for (const comment of comments) {
      if (comment.body === this.comment) {
        await client.issues.deleteComment({
          owner: this.owner,
          repo: this.repo,
          comment_id: comment.id
        })
        core.setOutput('delete-comment-id', comment.id)
        core.setOutput('delete-comment', true)
        break
      }
    }

    const {data: createCommentResponse } = await client.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: this.issueNumber,
      body: this.comment
    })

    core.setOutput('comment-id', createCommentResponse.id)
  }
}

export default {
  Reposter
}
