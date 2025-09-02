import * as React from "react";
import { useEffect, useMemo, type ChangeEvent } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { trimAllToLowerCase } from "../utils/trimAllToLowerCase";

export type PlayerInfo = {
  firstName: string;
  lastName: string;
  username: string;
};

type FormControlElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

type Props = {
  value: PlayerInfo[];
  onChange: (players: PlayerInfo[]) => void;
  childErrors: (hasErrors: boolean) => void;
};

const capitalizeFirst = (s: string) =>
  s.length ? s[0].toUpperCase() + s.slice(1) : s;

const AddDynamicInputFields: React.FC<Props> = ({
  value,
  onChange,
  childErrors,
}) => {
  const players = value;

  const duplicateUsernameIndices = useMemo(() => {
    const map = new Map<string, number[]>();

    players.forEach((p, i) => {
      const u = trimAllToLowerCase(p.username);

      if (!u) return;

      const list = map.get(u) ?? [];

      list.push(i);
      map.set(u, list);
    });

    const dups = new Set<number>();

    for (const idxs of map.values()) {
      if (idxs.length > 1) idxs.forEach((i) => dups.add(i));
    }

    return dups;
  }, [players]);

  const hasDuplicates = duplicateUsernameIndices.size > 0;

  useEffect(() => {
    childErrors(hasDuplicates);
  }, [hasDuplicates, childErrors]);

  const updateAtIndex = (index: number, patch: Partial<PlayerInfo>) => {
    const next = players.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    onChange(next);
  };

  const handleChange = (e: ChangeEvent<FormControlElement>, index: number) => {
    const key = e.currentTarget.name as keyof PlayerInfo; // "firstName" | "lastName" | "username"
    const raw = e.currentTarget.value;

    const value =
      key === "firstName" || key === "lastName" ? capitalizeFirst(raw) : raw;

    updateAtIndex(index, { [key]: value } as Partial<PlayerInfo>);
  };

  const handleAddInput = () => {
    const next = [...players, { firstName: "", lastName: "", username: "" }];
    onChange(next);
  };

  const handleDeleteInput = (index: number) => {
    const next = players.filter((_, i) => i !== index);
    onChange(next);
  };

  const lastIndex = players.length - 1;

  return (
    <Container>
      {hasDuplicates && (
        <div className="text-danger mb-2">
          Dubblett av användarnamn i listan.
        </div>
      )}

      {players.map((item, index) => (
        <React.Fragment key={index}>
          <Row className="border border-2 rounded border-secondary mt-3 py-4 p-4">
            <Col>
              <Row>
                <Col>
                  <Form.Control
                    name="username"
                    type="text"
                    autoComplete="off"
                    placeholder="Användarnamn"
                    value={item.username}
                    onChange={(event) => handleChange(event, index)}
                  />
                  {duplicateUsernameIndices.has(index) && (
                    <div className="text-danger mt-1">
                      Det här användarnamnet används redan.
                    </div>
                  )}

                  <Form.Control
                    className="mt-3"
                    name="firstName"
                    type="text"
                    autoComplete="off"
                    placeholder="Förnamn"
                    value={item.firstName}
                    onChange={(event) => handleChange(event, index)}
                  />

                  <Form.Control
                    className="mt-3"
                    name="lastName"
                    type="text"
                    autoComplete="off"
                    placeholder="Efternamn"
                    value={item.lastName}
                    onChange={(event) => handleChange(event, index)}
                  />
                </Col>
              </Row>

              <Row>
                <Col>
                  {players.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm bg-danger mt-4 w-100"
                      onClick={() => handleDeleteInput(index)}
                    >
                      Ta bort
                    </button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>

          <Row>
            <Col>
              {index === lastIndex && (
                <button
                  type="button"
                  className="btn btn-sm mt-4 fw-bold w-100"
                  onClick={handleAddInput}
                >
                  Lägg till ytterligare spelare
                </button>
              )}
            </Col>
          </Row>
        </React.Fragment>
      ))}
    </Container>
  );
};

export default AddDynamicInputFields;
