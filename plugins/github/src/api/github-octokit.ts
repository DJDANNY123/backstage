/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

import { Entity } from '@backstage/catalog-model';

import type { GithubCredentialsApi } from './github-credentials-api';
import type { GithubOctokitApi } from './github-octokit-api';
import { getEntitySourceLocationInfo } from '../utils';

export class GithubOctokit implements GithubOctokitApi {
  private readonly githubCredentialsApi: GithubCredentialsApi;

  constructor(options: { githubCredentialsApi: GithubCredentialsApi }) {
    this.githubCredentialsApi = options.githubCredentialsApi;
  }

  public async getRest(
    hostname: string | URL,
    scopes: string[],
  ): Promise<Octokit> {
    const { token, baseUrl } = await this.githubCredentialsApi.getCredentials(
      hostname,
      scopes,
    );

    return new Octokit({ auth: token, baseUrl });
  }

  public async getRestForEntity(entity: Entity, scopes: string[]) {
    const entityInfo = getEntitySourceLocationInfo(entity);
    const { url, ...ownerRepo } = entityInfo;

    const octokit = await this.getRest(url, scopes);

    return { octokit, ...ownerRepo };
  }

  public async getGraphql(hostname: string | URL, scopes: string[]) {
    const { token, baseUrl } = await this.githubCredentialsApi.getCredentials(
      hostname,
      scopes,
    );

    return graphql.defaults({
      baseUrl,
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  public async getGraphqlForEntity(entity: Entity, scopes: string[]) {
    const entityInfo = getEntitySourceLocationInfo(entity);
    const { url, ...ownerRepo } = entityInfo;

    const octokit = await this.getGraphql(url, scopes);

    return { octokit, ...ownerRepo };
  }
}
