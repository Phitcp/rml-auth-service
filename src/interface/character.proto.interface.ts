import { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';

export const protobufPackage = 'character';

export interface CreateCharacterProfileRequest {
  userId: string;
  userName: string;
}

export interface CreateCharacterProfileResponse {
  characterId: string;
  characterName: string;
  characterTitle: string;
  level: number;
  exp: number;
  nextLevelExp: number;
}

export interface GetCharacterProfileRequest {
  userId: string;
}

export interface GetCharacterProfileResponse {
  character: Character;
}

export interface GetCharacterProfileByBulkRequest {
  userIds: string[];
}

export interface GetCharacterProfileByBulkResponse {
  characters: Character[];
}

export interface Character {
  id: string;
  characterName: string;
  characterTitle: string;
  level: number;
  exp: number;
  nextLevelExp: number;
}

export const CHARACTER_PACKAGE_NAME = 'character';

export interface CharacterServiceClient {
  createCharacterProfile(
    request: CreateCharacterProfileRequest,
    metadata: Metadata,
  ): Observable<CreateCharacterProfileResponse>;

  getCharacterProfile(
    request: GetCharacterProfileRequest,
    metadata: Metadata,
  ): Observable<GetCharacterProfileResponse>;

  getCharacterProfileByBulk(
    request: GetCharacterProfileByBulkRequest,
    metadata: Metadata,
  ): Observable<GetCharacterProfileByBulkResponse>;
}

export const CHARACTER_SERVICE_NAME = 'CharacterService';
